var Corrida = (function() {

	var _pilotos = {}, /* Objeto dos dados dos pilotos */
    	_final = [];   /* Array com o resultado final da classificação */

    /*
     *  Lê o arquivo de log da corrida
     */
    function leLog(evt, inputLog) {
	    var logCorrida = new FileReader();

	    try {
	        logCorrida.readAsText(inputLog.files[0]);

	        logCorrida.onload = function (evt) {
	            var logs = evt.target.result.split(/\n|\r\n/);

	            _processaLog(logs);
	            _tempoTotal();
	            _classificacao();
	            _resultado();
	        }
	    } catch (err) {

	    }
	}

	/*
	 *  Processa as entradas do arquivo de log, criando objto dos pilotos
	 */
	function _processaLog(logs) {
	    var rowCells,
	        cod_nome;

	    for (var i = 1; i < logs.length; i++) {
	        rowCells = logs[i].split(';');
	        cod_nome = rowCells[1].split(' - ');

	        if (!_pilotos[cod_nome[0]]) {
	            _pilotos[cod_nome[0]] = {
	                nome: cod_nome[1],
	                voltas: [{
	                    numero_volta: rowCells[2],
	                    tempo_volta: rowCells[3],
	                    velocidade_media: rowCells[4],
	                    hora: rowCells[0]
	                }]
	            };
	        } else {
	            _pilotos[cod_nome[0]].voltas.push({
	                numero_volta: rowCells[2],
	                tempo_volta: rowCells[3],
	                velocidade_media: rowCells[4],
	                hora: rowCells[0]
	            });
	        }
	    }
	}

	/*
	 *  Calcula o tempo total de cada volta dos pilotos
	 */
	function _tempoTotal() {
	    var t,
	        tempo,
	        voltas;

	    for (var prop in _pilotos) {
	        voltas = _pilotos[prop].voltas;

	        if (voltas.length > 0) {
	            tempo = voltas[0].tempo_volta.replace('.', ':');
	            tempo = tempo.split(':');

	            t = new Date();

	            t.setMilliseconds(parseInt(tempo[2]));
	            t.setSeconds(parseInt(tempo[1]));
	            t.setMinutes(parseInt(tempo[0]));
	        }

	        for (var i = 1; i < voltas.length; i++) {
	            tempo = voltas[i].tempo_volta.replace('.', ':');
	            tempo = tempo.split(':');

	            t.setMilliseconds(t.getMilliseconds() + parseInt(tempo[2]));
	            t.setSeconds(t.getSeconds() + parseInt(tempo[1]));
	            t.setMinutes(t.getMinutes() + parseInt(tempo[0]));
	        }

	        _pilotos[prop].codigo = prop;
	        _pilotos[prop].tempo_total_volta = t.getMinutes() + ':' + t.getSeconds() + '.' + t.getMilliseconds();

	        _final.push(_pilotos[prop]);
	    }
	}

	/*
	 *  Faz a classificação da posicão de chegada dos pilotos
	 */
	function _classificacao() {
	    var n = _final.length,
	        offset = n,
	        inOrder,
	        temp;

	    do {
	        offset = parseInt((8 * offset) / 11);
	        offset = offset == 0 ? 1 : offset;
	        inOrder = true;
	        for (i = 0, j = offset; i < (n - offset); i++, j++) {
	            if (_final[i]['tempo_total_volta'] > _final[j]['tempo_total_volta'] && _final[i]['voltas'].length === 4) {
	                inOrder = false;
	                temp = _final[i];
	                _final[i] = _final[j];
	                _final[j] = temp;
	            }
	        } 
	    } while (!(offset == 1 && inOrder == true));
	}

	/*
	 *  Constroi o resultado final da classificação e sua apresentação
	 */
	function _resultado() {
	    var strOutput = '';

	    for (var i = 0; i < _final.length; i++) {
	        strOutput += '<tr>';
	        strOutput += '<td>' + (_final[i].voltas.length === 4 ? (i + 1) + 'º' : '--') + '</td>';
	        strOutput += '<td>' + _final[i].codigo + '</td>';
	        strOutput += '<td>' + _final[i].nome + '</td>';
	        strOutput += '<td>' + _final[i].voltas.length + '</td>';
	        strOutput += '<td>' + _final[i].tempo_total_volta + '</td>';
	        strOutput += '</tr>';
	    }

	    _pilotos = {};
	    _final = [];

	    document.querySelector('tbody').innerHTML = strOutput;
	}

	return {
		leLog: leLog
	}

})();