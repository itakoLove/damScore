const damScore = {
	isProcessing: false,
	isFirst: true,
	hasNext: true,
	pageCount: 40,

	attributeList: [],
	scoreList: [],
	sendBody: {},

	dialog: null,

	start: async () => {
		const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
		
		if (damScore.dialog === null) {
			damScore.dialog = document.createElement('dialog');
			document.body.appendChild(damScore.dialog);
		}
		damScore.dialog.showModal();
		
		if (location.href !== 'https://www.clubdam.com/app/damtomo/MyPage.do' && location.href !== 'https://www.clubdam.com/app/damtomo/SP/MyPage.do') {
			damScore.dialog.innerHTML = '<p>DAMともサイトのマイページにアクセスしてください</p>' + 
					'<p>マイページでログインした状態でこちらのスクリプトを実行してください</p>';
			await sleep(5000);
			damScore.dialog.close();
		}
		
		
		damScore.dialog.innerHTML = '<p>採点データを取得しています</p>';
		
		let _damtomoId = null;
		if (typeof damtomoId === 'undefined') {
			_damtomoId = document.querySelector('#ProfileCommentDamtomoId').value;
		} else {
			_damtomoId = damtomoId.value;
		}
		
		let _cdmCardNo = null;
		if (typeof cdmCardNo === 'undefined') {
			let url = new URL(document.querySelectorAll('.denmoku a')[1].href)
			_cdmCardNo = url.searchParams.get('cdmCardNo');
		} else {
			_cdmCardNo = cdmCardNo[0].value;
		}
		
		damScore.sendBody.user = {
			damtomoId: _damtomoId,
			cdmCardNo: _cdmCardNo,
			name: document.querySelector('.profile-name strong').innerText
		};
		
		damScore.sendBody.scoreList = [];
		
		for (let i = 1; i <= 40; i++) {
			damScore.dialog.innerHTML = '<p>採点データを取得しています(' + i + '/' + damScore.pageCount + ')</p>';
			damScore.isProcessing = true;

			const xhr = new XMLHttpRequest();
			const url = 'https://www.clubdam.com/app/damtomo/scoring/GetScoringDxgListXML.do?cdmCardNo=' + _cdmCardNo + /*'&cdmToken=' + cdmToken.value + */ '&enc=utf8&pageNo=' + i + '&detailFlg=1&dxgType=1&UTCserial=' + new Date().getTime();
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
						
						damScore.hasNext = doc.querySelector('data page').getAttribute('hasNext') === '1';
						damScore.pageCount = Number(doc.querySelector('data page').getAttribute('pageCount'));
					}
				}
			}
			while (damScore.isProcessing) await sleep(100);

			if (!damScore.hasNext) break;
		}

		damScore.dialog.innerHTML = '<p>DAMスコアサイトに採点データを送信しています</p>';

		const xhr = new XMLHttpRequest();
		xhr.open("POST", "https://damscore-back.to8823.workers.dev/api/set", true);
		xhr.send(JSON.stringify(damScore.sendBody));

		xhr.onreadystatechange = () => {
			if (xhr.readyState === XMLHttpRequest.DONE) {
				const status = xhr.status;
				if (status === 0 || (status >= 200 && status < 400)) {
					damScore.dialog.innerHTML = '<p>送信が完了しました。</p><p>5秒後に画面更新を実施します</p>';
					setTimeout(() => location.reload(), 5000);
				}
			}
		};

	}

};
