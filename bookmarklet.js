const damScore = {
	isProcessing: false,
	isFirst: true,

	attributeList: [],
	scoreList: [],
	sendBody: {},

	start: async () => {
		const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
		
		damScore.sendBody.user = {
			damtomoId: damtomoId.value,
			cdmCardNo: cdmCardNo[0].value,
			name: document.querySelector('.profile-name strong').innerText
		};
		
		damScore.sendBody.scoreList = [];
		
		for (let i = 1; i <= 40; i++) {
			damScore.isProcessing = true;

			const xhr = new XMLHttpRequest();
			const url = 'https://www.clubdam.com/app/damtomo/scoring/GetScoringDxgListXML.do?cdmCardNo=' + cdmCardNo[0].value + '&cdmToken=' + cdmToken.value + '&enc=utf8&pageNo=' + i + '&detailFlg=1&dxgType=1&UTCserial=' + new Date().getTime();
			xhr.open("GET", url);
			xhr.send();

			xhr.onreadystatechange = (e) => {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					const status = xhr.status;
					if (status === 0 || (status >= 200 && status < 400)) {
						const xmlStr = xhr.responseText.replaceAll(/\r\n/g, '');
						const parser = new DOMParser();
						const doc = parser.parseFromString(xmlStr, "application/xml");

						for (const node of doc.querySelectorAll('list scoring')) {
							const obj = {};
							for (const name of node.getAttributeNames()) {
								if (damScore.isFirst) damScore.attributeList.push(name);
								obj[name] = node.getAttribute(name);
							}
							if (damScore.isFirst) damScore.attributeList.push('totalPoints');
							obj.totalPoints = node.textContent;
							damScore.sendBody.scoreList.push(obj);

							damScore.isFirst = false;
						}

						damScore.isProcessing = false;
					}
				}
			}
			while (damScore.isProcessing) await sleep(100);

		}

		const xhr = new XMLHttpRequest();
		xhr.open("POST", "https://damscore-back.to8823.workers.dev/api/set", true);

		xhr.onreadystatechange = () => {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				const status = xhr.status;
				if (status === 0 || (status >= 200 && status < 400)) {
					alert('Complete!');
				}
			}
		};

		xhr.send(JSON.stringify(damScore.sendBody));

		/*
		document.body.remove();
		document.body = document.createElement('body');

		document.body.innerText = JSON.stringify(damScore.sendBody);
		*/

		/*
		const tableElem = document.createElement('table');

		let headerElem = document.createElement('tr');
		for (const att of damScore.attributeList) {
			let e = document.createElement('th');
			e.innerText = att;
			headerElem.appendChild(e);
		}
		tableElem.appendChild(headerElem);

		for (const score of damScore.sendBody.scoreList) {
			let trElem = document.createElement('tr');
			for (const att of damScore.attributeList) {
				let tdElem = document.createElement('td');
				tdElem.innerText = score[att];
				trElem.appendChild(tdElem);
			}
			tableElem.appendChild(trElem);
		}

		document.body.appendChild(tableElem);
		*/
	}

};
damScore.start();
