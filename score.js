const ARTIST_MAX_LENGTH = 35;

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
					headerItems = headerItems.concat([
							{value:'曲名'},
							{value:'アーティスト名'},
							{value:'総合得点'},
							{value:'音程正確率'},
							{value:'安定性点数'},
							{value:'表現点数'},
							{value:'ビブラート＆ロングトーン点数'},
							{value:'リズム点数'},
							{value:'採点日時', className:'datetime'}
					]);
					
					let headerElem = ce('tr');
					for (let headerItem of headerItems) {
						let headerItemElem = ce('th');
						headerItemElem.innerText = headerItem.value;
						if (headerItem.className) headerItemElem.className = headerItem.className;
						headerElem.appendChild(headerItemElem);
					}
					tableElem.appendChild(headerElem);


					for (let score of scoreList) {
						let scoreElem = ce('tr');
						
						let artistName = score.artistName.substr(0,ARTIST_MAX_LENGTH);
						if (score.artistName.length > ARTIST_MAX_LENGTH) artistName += '(ry';
						
						let totalPoints = (score.totalPoints / 1000).toFixed(3);

						let scoringDateTime = score.scoringDateTime;
						scoringDateTime = scoringDateTime.substr(0,4) + '/' + scoringDateTime.substr(4,2) + '/' + scoringDateTime.substr(6,2) + ' ' + scoringDateTime.substr(8,2) + ':' + scoringDateTime.substr(10,2) + ':' + scoringDateTime.substr(12,2);

						let dataItems = [];
						if (!isFilteredByUser) dataItems.push(score.name);
						dataItems = dataItems.concat([
								{value:score.contentsName},
								{value:artistName},
								{value:totalPoints, className:'right'},
								{value:score.radarChartPitch, className:'right'},
								{value:score.radarChartStability, className:'right'},
								{value:score.radarChartExpressive, className:'right'},
								{value:score.radarChartVibratoLongtone, className:'right'},
								{value:score.radarChartRhythm, className:'right'},
								{value:scoringDateTime}
						]);
						
						for (let dataItem of dataItems) {
							let dataItemElem = ce('td');
							dataItemElem.innerText = dataItem.value;
							if (dataItem.className) dataItemElem.className = dataItem.className;
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
					headerItems = headerItems.concat([
							{value:'曲名'},
							{value:'アーティスト名'},
							{value:'平均点'},
							{value:'最高点'},
							{value:'回数'},
							{value:'最後に歌った日時', className:'datetime'}
					]);
					
					let headerElem = ce('tr');
					for (let headerItem of headerItems) {
						let headerItemElem = ce('th');
						headerItemElem.innerText = headerItem.value;
						if (headerItem.className) headerItemElem.className = headerItem.className;
						headerElem.appendChild(headerItemElem);
					}
					tableElem.appendChild(headerElem);
					
					for (let request of requestNoList) {
						let scoreElem = ce('tr');
						
						let artistName = request.artistName.substr(0,ARTIST_MAX_LENGTH);
						if (request.artistName.length > ARTIST_MAX_LENGTH) artistName += '(ry';

						let targetSongScoreList = scoreList.filter(x => x.clubDamCardNo === request.clubDamCardNo && x.requestNo === request.requestNo);
						
						let maxPoint = (targetSongScoreList.reduce((x, y) => Math.max(x, y.totalPoints), -1) / 1000).toFixed(3);
						let avePoint = (targetSongScoreList.reduce((x, y) => x + y.totalPoints, 0) / targetSongScoreList.length / 1000).toFixed(3);
						let count = targetSongScoreList.length;

						let scoringDateTime = targetSongScoreList.reduce((x, y) => Math.max(x, Number(y.scoringDateTime)), -1) + '';
						scoringDateTime = scoringDateTime.substr(0,4) + '/' + scoringDateTime.substr(4,2) + '/' + scoringDateTime.substr(6,2) + ' ' + scoringDateTime.substr(8,2) + ':' + scoringDateTime.substr(10,2) + ':' + scoringDateTime.substr(12,2);

						let dataItems = [];
						if (!isFilteredByUser) dataItems.push(request.name);
						dataItems = dataItems.concat([
								{value:request.contentsName},
								{value:artistName},
								{value:avePoint, className:'right'},
								{value:maxPoint, className:'right'},
								{value:count, className:'right'},
								{value:scoringDateTime}
						]);
						
						for (let dataItem of dataItems) {
							let dataItemElem = ce('td');
							dataItemElem.innerText = dataItem.value;
							if (dataItem.className) dataItemElem.className = dataItem.className;
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
