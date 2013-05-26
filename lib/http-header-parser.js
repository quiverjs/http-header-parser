
"use strict"

var error = require('quiver-error').error

var containControlCharacters = function(text) {
  return /[^\u0020-\u007E]/.test(text)
}

var containTokenSeparators = function(text) {
  return /[\(\)\<\>@,;:\\"\/\[\]?=\{\} \t]/.test(text)
}

var isValidHeaderName = function(headerName) {
  return !containControlCharacters(headerName) && !containTokenSeparators(headerName)
}

var parseHttpRequestLine = function(requestLineText, callback) {
  var tokens = requestLineText.trim().split(' ')
  if(tokens.length != 3) return callback(error(400, 'Bad Request'))

  var requestLine = {
    method: tokens[0],
    uri: tokens[1],
    version: tokens[2]
  }

  callback(null, requestLine)
}

var parseHttpResponseLine = function(responseLineText, callback) {
  var tokens = responseLineText.trim().split(' ')
  if(tokens.length != 3) return callback(error(400, 'Bad Request'))

  var statusCode = tokens[1]
  if(/^[0-9]$/.test(statusCode)) return callback(error(444, 'Malformed Response'))

  var responseLine = {
    version: tokens[0],
    statusCode: parseInt(statusCode),
    statusMessage: tokens[2]
  }

  callback(null, responseLine)
}

var parseHttpHeaders = function(headersText, callback) {
  var rawHeaders = headersText.split('\r\n')
  var joinedHeaders = []

  for(var i=0; i<rawHeaders.length; i++) {
    var header = rawHeaders[i]
    var firstChar = header.charAt(0)
    
    if(firstChar == ' ' || firstChar == '\t') {
      if(joinedHeaders.length == 0) return callback(error(400, 'Bad Request'))

      joinedHeaders[joinedHeaders.length-1] += header
    } else {
      joinedHeaders.push(header)
    }
  }
  
  var headers = { }
  for(var i=0; i<joinedHeaders.length; i++) {
    var header = joinedHeaders[i]
    var colonIndex = header.indexOf(':')
    if(colonIndex < 1) return callback(error(400, 'Bad Request'))

    var headerKey = header.slice(0, colonIndex).toLowerCase()
    if(!isValidHeaderName(headerKey)) return callback(error(400, 'Bad Request'))
    
    var headerValue = header.slice(colonIndex+1).replace(/\s+/g, ' ').trim()

    if(headers[headerKey]) {
      headers[headerKey] += ', ' + headerValue
    } else {
      headers[headerKey] = headerValue
    }
  }

  callback(null, headers)
}

module.exports = {
  parseHttpRequestLine: parseHttpRequestLine,
  parseHttpResponseLine: parseHttpResponseLine,
  parseHttpHeaders: parseHttpHeaders
}