/**
 * @class Music 播放器对象
 * @param {Object} options参数
 * @param {Object} options.el 播放器父容器节点
 * @param {Array} options.list 播放器歌曲list（格式如下）
 * */
/* 
    list = [{
        name: '歌曲名字'，
        url: '歌曲地址'
    }]
*/
(function($,win){
    let Music = function(options){
        this.el = options.el || win.document;
        this.musicList = options.list || [];
        this.touch = {
            initial: false,
            startX: 0,
            left: 0
        };
		this.currentIndex = 0;
        this.songReady = false;
        this.playing = false;
        this._init();
        if (this.musicList.length){
            setTimeout(() => {
                this.play(this.musicList)
            }, 300);
        }
    }
    Music.prototype._init = function(){
		let that = this;
        this.el.innerHTML = `<div class="music-player-wrapper">
								<div class="player-wrapper">
									<div class="progress-wrapper">
										<div class="progress-bar-wrapper">
											<div class="progress-bar">
												<div class="bar-inner">
													<div class="progress" id="progress"></div>
													<div class="progress-btn-wrapper">
														<div class="progress-btn" id="progress-btn"></div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div class="mv-time">
										<div class="mv-time-progress" id="currentTime">00:00</div>
										<div class="mv-total-time" id="totalTime">00:00</div>
									</div>
									<div class="file-title"></div>
									<div class="mv-control">
										<span class="iconfont icon-kuaitui" id="prev"></span>
										<span class="iconfont icon-bofang" id="play-pause"></span>
										<span class="iconfont icon-kuaijin" id="next"></span>
									</div>
									<div class="playlist" style="display: none">
										<audio id="music-audio" autoplay="autoplay" src=""></audio>
									</div>
								</div>
							</div>`;
        this.$audio = $('#music-audio');
        this.$progress = $('#progress');
        this.$progressBtn = $('#progress-btn');
        this.barWidth = $('.player-wrapper').parent().width() - this.$progressBtn.outerWidth();
		this.$title = $('.file-title');
        this.$next = $('#next');
        this.$prev = $('#prev');
        this.$play_pause = $('#play-pause');
        this.$currentTime = $('#currentTime');
        this.$totalTime = $('#totalTime');
        //audio自带播放事件
        this.$audio.on('play',function() {
            //console.log(this.audio[0].duration)//时长 时间戳
            that.songReady = true;//歌曲初始化成功
            that.playing = true;//播放状态
            that.totalTime = that._format(that.$audio[0].duration)
            that.$totalTime.text(that._format(that.$audio[0].duration));
        })
        //audio自带更新进度事件
        this.$audio.on('timeupdate', function(e) {
            //console.log(e.target.currentTime)//当前播放时间戳
            let currentTime = e.target.currentTime;
            let percent = currentTime / that.$audio[0].duration;
            let offsetWidth = (that.barWidth * percent) + 'px';
            if(!that.touch.initial){
                that.$progress.css({width: offsetWidth});
                that.$progressBtn.css({transform: 'translate3d('+ offsetWidth +',0,0)'});
            }
            if(percent == 1){//播放完毕按钮切换
                that.$play_pause.removeClass('icon-bofang').addClass('icon-bofang1'); 
                that.playing = !that.playing; 
            }
            that.$currentTime.text(that._format(e.target.currentTime));
        })
		//下一首
		this.$next.on('click', function(){
			that.currentIndex += 1;
			if(that.currentIndex >= that.musicList.length){
				that.currentIndex = 0;
			}
			that._setPlayCur(that.musicList[that.currentIndex]);
		})
		//上一首
		this.$prev.on('click', function(){
			that.currentIndex -= 1;
			if(that.currentIndex < 0){
				that.currentIndex = that.musicList.length - 1;
			}
			that._setPlayCur(that.musicList[that.currentIndex]);
		})
        //播放暂停切换
        this.$play_pause.on('click',function() {
            if (!that.songReady) {
                return
            }
            if(that.playing){
                that.$play_pause.removeClass('icon-bofang').addClass('icon-bofang1');
                that.$audio[0].pause();
            }else{
                that.$play_pause.removeClass('icon-bofang1').addClass('icon-bofang');
                that.$audio[0].play();
            }
            that.playing = !that.playing;
        })
        //播放条操作
        this.$progressBtn.on('touchstart',function(e) {
            e.preventDefault()
            that.touch.initial = true;
            that.touch.startX = e.originalEvent.touches[0].pageX;
            that.touch.left = that.$progress.width();
        })
        this.$progressBtn.on('touchmove',function(e) {
            e.preventDefault()
            if(!that.touch.initial) return;
            let deltaX = e.originalEvent.touches[0].pageX - that.touch.startX;
            let offsetWidth = Math.min( that.barWidth , Math.max(0, that.touch.left + deltaX)) + 'px';
            that.$progress.css({width: offsetWidth});
            that.$progressBtn.css({transform: 'translate3d('+ offsetWidth +',0,0)'});
        })
        this.$progressBtn.on('touchend',function(e) {
            that.touch.initial = false;
            let timePercent = that.$progress.width() / that.barWidth;
            let dragTotime = timePercent * that.$audio[0].duration;
            that.$audio[0].currentTime = dragTotime;
            if(!that.playing){
                that.$play_pause.trigger('click')
            }
        })
    }
    Music.prototype._format = function(time) {
        time = time | 0
        const minute = (time / 60 | 0 ) .toString().length < 2 ? "0" + ( time / 60 | 0 ) : (time / 60 | 0 )
        const second = (time % 60).toString().length < 2 ? "0" + (time % 60) : (time % 60)
        return `${minute}:${second}`
    }
    //播放
	Music.prototype.play = function (options){
		this.musicList = options;
		this.currentIndex = 0;
		this.resetBar();
		this._setPlayCur(options[0]);
    }
    //停止播放
	Music.prototype.stopPlay = function (options){
		this.musicList = [];
		this.$title.text("");
		this.$progress.css({width: 0});
		this.$progressBtn.css({transform: 'translate3d(0,0,0)'});
		this.$audio.attr("src", "");
		
	}
	Music.prototype.resetBar = function() {
		this.barWidth = $('.player-wrapper').parent().width() - this.$progressBtn.outerWidth();
	}
	Music.prototype._setPlayCur = function(r) {
		this.$title.text(r.name);
		this.$audio.attr("src", r.url);
	}
    win.Music = Music
})(jQuery,window)