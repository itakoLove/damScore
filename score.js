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
				
				// scoreList.sort((a,b) => Number(b.scoringDxgId) - Number(a.scoringDxgId));

				const ce = a => document.createElement(a);
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
					
					let totalPoints = (score.totalPoints / 1000).toFixed(3);

					let scoringDateTime = score.scoringDateTime;
					scoringDateTime = scoringDateTime.substr(0,4) + '/' + scoringDateTime.substr(4,2) + '/' + scoringDateTime.substr(6,2) + ' ' + scoringDateTime.substr(8,2) + ':' + scoringDateTime.substr(10,2) + ':' + scoringDateTime.substr(12,2);

					let dataItems = [];
					if (!isFilteredByUser) dataItems.push(score.name);
					dataItems = dataItems.concat([score.contentsName, score.artistName, totalPoints, score.radarChartPitch, score.radarChartStability, score.radarChartExpressive, score.radarChartVibratoLongtone, score.radarChartRhythm, scoringDateTime]);
					
					for (let dataItem of dataItems) {
						let dataItemElem = ce('td');
						dataItemElem.innerText = dataItem;
						scoreElem.appendChild(dataItemElem);
					}

					tableElem.appendChild(scoreElem);
				}
				
				document.querySelector('#list1').appendChild(tableElem);

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
