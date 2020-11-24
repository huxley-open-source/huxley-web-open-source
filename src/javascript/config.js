/**
 * Não modifique esse arquivo, para apontar a interface para a sua api rest local crie um arquivo "config-dev.js"
 * (não remova o config-dev.js do git ignore) como o exemplo abaixo:
 *
 * Exemplo para o arquivo config-dev.js
  */
//window.thDev = {
//    apiRootPath: 'http://localhost:8080/api/v1',
//    oauthRootPath: 'http://localhost:8080/api'
//};

var thDev = window.thDev || {};

window.th = {
    apiRootPath: thDev.apiRootPath || 'https://www.thehuxley.com/api/v1',
    oauthRootPath: thDev.oauthRootPath || 'https://www.thehuxley.com/api',
    debugEnabled: thDev.debugEnabled || false
};
