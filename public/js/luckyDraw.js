var HOST = 'http://h5api.aylives.cn/prize/prize/api';
//var HOST = 'http://localhost:10082/prize/api';
var MAIN_URL ='/main';
var DRAW_URL ='/drawprize';
var draw_time=0;
var isprizeornot = 0;
function isToday(str){
    var d = new Date(str.replace(/-/g,"/"));
    var todaysDate = new Date();
    if(d.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)){
        return true;
    } else {
        return false;
    }
}

$(function() {
    var elem1 = $(".luckyDraw_top");
    var elem2 = $(".luckyDraw_sec2");
    var h1 = $(window).height();
    var h2 = elem1.height() + elem2.height();
    //获奖名单滚动
    $('#demo').vTicker({
        speed: 500,
        pause: 1000,
        animation: 'fade',
        mousePause: false,
        showItems: 4
    });
    
    if (h1 < h2) {
        var hh = h2 - h1;
        $("body").animate({
            "scrollTop": hh + "px"
        }, 100);
    }
    
    $.ajax({
    	type:"post",
    	url:HOST+MAIN_URL,
    	async:true,
//  	data: {username:$("#username").val(), content:$("#content").val()},
        dataType: "json",
        success: function(data){
        	if(data.code==200){
        		//大屏图片
        		$('#headImg').attr('src',data.data.config.headImg);
        		
        		//活动规则 说明
	        	$('#rule_id').empty();
	        	var ruleText = data.data.config.ruleText;
	        	var ruleTextAry = ruleText.split('，');
	        	for(var i=0;i<ruleTextAry.length;i++){
	        		$('#rule_id').append('<li>'+ruleTextAry[i]+'</li>');
	        	}
	        	
	        	//中奖名单
	        	$('#name_list').empty();
	        	var nameList = data.data.prizeRecords;
	        	for(var i1=0;i1<nameList.length;i1++){
	        		var tel = nameList[i1].phone.substr(0,3)+"****"+nameList[i1].phone.substr(7,11);
	        		var date = nameList[i1].date;
	        		if(isToday(date)){
	        			$('#name_list').append('<li>手机号'+tel+' 今天 '+date.substr(10)+'抽中 '+ nameList[i1].prizeName+'</li>');
	        		}else{
	        			$('#name_list').append('<li>手机号'+tel+' 在 '+date.substr(0,11)+'抽中 '+ nameList[i1].prizeName+'</li>');
	        		}
	        	}
	        	
	        	//我的中奖
	        	var minePrizeRecord = data.data.minePrizeRecord;
	        	if(minePrizeRecord!=null && minePrizeRecord!=undefined && minePrizeRecord.prizeId!=0&& minePrizeRecord.prizeId!=null){
	        		$('#mineprize').css("display","block");
	        		$('#mineprize').append("我的奖品 :"+data.data.minePrizeRecord.prizeName);
	        		isprizeornot = 1;
	        	}else{
	        		//当前用户
		        	var currentUser = data.data.currentUser;
		        	$('#mineprize').css("display","block");
		        	if(currentUser!=null && currentUser!=undefined){
		        		draw_time = data.data.currentUser.count;
		        	}else{
		        		draw_time = 0;
		        	}
		        	$('#mineprize').append("还剩余抽奖机会:"+draw_time+"次");
		        	isprizeornot = 0;
	        	}
	        	
	        	//图片更新
	        	var prizesAry = data.data.prizes;
	        	for(var i2=0;i2<prizesAry.length;i2++){
	        		var picid = '#pic'+prizesAry[i2].prizePosition;
	        		$('#pic'+prizesAry[i2].prizePosition).attr('src',prizesAry[i2].prizePic);
	        	}
	        	
	        	
	        	//实现抽奖
			    lottery.lottery({
			        selector: '#lottery',
			        width: 3,
			        height: 3,
			        index: 0, // 初始位置
			        initSpeed: 500, // 初始转动速度
			        // upStep:       50,   // 加速滚动步长
			        // upMax:        50,   // 速度上限
			        // downStep:     30,   // 减速滚动步长
			        // downMax:      500,  // 减速上限
			        // waiting:      5000, // 匀速转动时长
			        beforeRoll: function() { // 重写滚动前事件：beforeRoll
			        	if(isprizeornot==0){
			        		lottery.options.isprize = false;
			        	}else{
			        		lottery.options.isprize = true;
			        	}
						this.options.drawcount=draw_time;
			        },
			        beforeDown: function() {
//			        	this.options.target = 0;
						var optionTarget = this.options.target;
						
					    $.ajax({
					    	type:"post",
					    	url:HOST+DRAW_URL,
//							url:"",
					    	async:false,
					//  	data: {username:$("#username").val(), content:$("#content").val()},
					        dataType: "json",
					        success: function(data){
					        	if(data.code==200){
					        		console.log(data.data.prize.prizePosition);
//						        		alert("恭喜您，中奖"+data.data.prize.prizeName+"一个");
									lottery.options.target = data.data.prize.prizePosition;
									lottery.options.isprize = true;
									lottery.options.prizemsg = "恭喜您，中奖"+data.data.prize.prizeName+"一个";
					        	}else if(data.code==201){
//					        		console.log(data.data.prize.prizePosition);
									lottery.options.target = data.data.prizeId;
									lottery.options.isprize = false;
									lottery.options.prizemsg = "您未中奖~";
					        	}else
					        	{
					        		alert(data.msg);
					        	}
					        },error:function(data){
					        	console.log(data);
					        	
//		        	            $.popup({
//						              title: "提示",
//						              message: "很遗憾这次没抽中",
//						              cancelText: "确定",
//						              cancelCallback: function() {
////						                  _this.beforeRoll(1);
// 										console.log("确定点击后的事件");
//						              },
//						              doneText: "确定",
//						              doneCallback: function() {
//						                  console.log("确定点击后的事件");
//						              },
//						              cancelOnly: true
//					            });
					        }
				        });
			        }
			        
			    });
	        	
        	}else{
        		alert(data.msg);
        	}
      	}
    });
    
    
});