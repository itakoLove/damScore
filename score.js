const qs = a => document.querySelector(a);
var load = () => {
	const url = new URL(location.href);
	// ODAwMDA0NTQ3ODM2MzM5
	let sendUrl = 'https://damscore-back.to8823.workers.dev/api/get/score';
	const clubDamCardNo = url.searchParams.get('clubdamcardno');
	var isFilteredByUser = false;
	if (clubDamCardNo !== null) {
		sendUrl += '?clubdamcardno=' + clubDamCardNo;
		isFilteredByUser = true;
	}

	const xhr = new XMLHttpRequest();
	xhr.open("GET", sendUrl);
	xhr.send();

	xhr.onreadystatechange = (e) => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			const status = xhr.status;
			if (status === 0 || (status >= 200 && status < 400)) {
				const scoreList = JSON.parse(xhr.responseText);

				const ce = a => document.createElement(a);
				
				{
					let tableElem = ce('table');
					
					let headerItems = [];
					if (!isFilteredByUser) headerItems.push('歌唱者');
					headerItems = headerItems.concat(['曲名', 'アーティスト名', '総合得点', '音程正確率', '安定性点数', '表現点数', 'ビブラート＆ロングトーン点数', 'リズム点数', '採点日時']);
					
					let headerElem = ce('tr');
					for (let headerItem of headerItems) {
						let headerItemElem = ce('th');
						headerItemElem.innerText = headerItem;
						headerElem.appendChild(headerItemElem);
					}
					tableElem.appendChild(headerElem);


					for (let score of scoreList) {
						let scoreElem = ce('tr');
						
						let artistName = score.artistName.substr(0,40);
						if (score.artistName.length > 40) artistName += '(ry';
						
						let totalPoints = (score.totalPoints / 1000).toFixed(3);

						let scoringDateTime = score.scoringDateTime;
						scoringDateTime = scoringDateTime.substr(0,4) + '/' + scoringDateTime.substr(4,2) + '/' + scoringDateTime.substr(6,2) + ' ' + scoringDateTime.substr(8,2) + ':' + scoringDateTime.substr(10,2) + ':' + scoringDateTime.substr(12,2);

						let dataItems = [];
						if (!isFilteredByUser) dataItems.push(score.name);
						dataItems = dataItems.concat([score.contentsName, artistName, totalPoints, score.radarChartPitch, score.radarChartStability, score.radarChartExpressive, score.radarChartVibratoLongtone, score.radarChartRhythm, scoringDateTime]);
						
						for (let dataItem of dataItems) {
							let dataItemElem = ce('td');
							dataItemElem.innerText = dataItem;
							scoreElem.appendChild(dataItemElem);
						}

						tableElem.appendChild(scoreElem);
					}
					
					document.querySelector('#list1').appendChild(tableElem);
				}
				
				{
					let requestNoList = scoreList.map(({ clubDamCardNo, name, requestNo, contentsName, artistName }) => ({clubDamCardNo:clubDamCardNo, name:name, requestNo:requestNo, contentsName:contentsName, artistName:artistName}));
					requestNoList = Array.from(new Map(requestNoList.map((request) => [request.clubDamCardNo + ',' + request.requestNo, request])).values());
					console.log(requestNoList);

					let tableElem = ce('table');
					
					let headerItems = [];
					if (!isFilteredByUser) headerItems.push('歌唱者');
					headerItems = headerItems.concat(['曲名', 'アーティスト名', '平均点', '最高点', '回数', '最後に歌った日時']);
					
					let headerElem = ce('tr');
					for (let headerItem of headerItems) {
						let headerItemElem = ce('th');
						headerItemElem.innerText = headerItem;
						headerElem.appendChild(headerItemElem);
					}
					tableElem.appendChild(headerElem);
					
					for (let request of requestNoList) {
						let scoreElem = ce('tr');
						
						let artistName = request.artistName.substr(0,40);
						if (request.artistName.length > 40) artistName += '(ry';

						let targetSongScoreList = scoreList.filter(x => x.clubDamCardNo === request.clubDamCardNo && x.requestNo === request.requestNo);
						
						let maxPoint = (targetSongScoreList.reduce((x, y) => Math.max(x, y.totalPoints), -1) / 1000).toFixed(3);
						let avePoint = (targetSongScoreList.reduce((x, y) => x + y.totalPoints, 0) / targetSongScoreList.length / 1000).toFixed(3);
						let count = targetSongScoreList.length;

						let scoringDateTime = targetSongScoreList.reduce((x, y) => Math.max(x, Number(y.scoringDateTime)), -1) + '';
						scoringDateTime = scoringDateTime.substr(0,4) + '/' + scoringDateTime.substr(4,2) + '/' + scoringDateTime.substr(6,2) + ' ' + scoringDateTime.substr(8,2) + ':' + scoringDateTime.substr(10,2) + ':' + scoringDateTime.substr(12,2);

						let dataItems = [];
						if (!isFilteredByUser) dataItems.push(request.name);
						dataItems = dataItems.concat([request.contentsName, artistName, avePoint, maxPoint, count, scoringDateTime]);
						
						for (let dataItem of dataItems) {
							let dataItemElem = ce('td');
							dataItemElem.innerText = dataItem;
							scoreElem.appendChild(dataItemElem);
						}

						tableElem.appendChild(scoreElem);
					}
					
					document.querySelector('#list2').appendChild(tableElem);
				}
				
			}
		}
	}
};

var clickButton = e => {
	let id = e.srcElement.getAttribute('_target');
	for (let elem of document.querySelectorAll('#list_area div')) {
		if (elem.id === id) {
			elem.style.display = 'block';
		} else {
			elem.style.display = 'none';
		}
	}
};
