
"use strict"

var should = require('should')
var headerParser = require('../lib/http-header-parser')

describe('parse header test', function() {
  it('parse normal headers', function(callback) {
    var headersText = 'host: localhost\r\n' +
      'Content-Type: text/html\r\n' +
      'Content-Length: 100'

    headerParser.parseHttpHeaders(headersText, function(err, headers) {
      if(err) throw err

      headers['host'].should.equal('localhost')
      headers['content-type'].should.equal('text/html')
      headers['content-length'].should.equal('100')

      callback()
    })
  })

  it('parse folded headers', function(callback) {
    var headersText = 'host: localhost\r\n' +
      'Folding-Header: first  line  \r\n' +
      '  second line  \r\n' +
      'Last-Header: last value'

    headerParser.parseHttpHeaders(headersText, function(err, headers) {
      if(err) throw err

      headers['host'].should.equal('localhost')
      headers['folding-header'].should.equal('first line second line')
      headers['last-header'].should.equal('last value')

      callback()
    })
  })

  it('test join headers', function(callback) {
    var headersText = 'First-Header: begin\r\n' +
      'Join-Header: first value\r\n' +
      'Other-Header: other value\r\n' +
      'Join-HEader: second value\r\n' +
      'Last-Header: end'


    headerParser.parseHttpHeaders(headersText, function(err, headers) {
      if(err) throw err

      headers['first-header'].should.equal('begin')
      headers['join-header'].should.equal('first value, second value')
      headers['other-header'].should.equal('other value')
      headers['last-header'].should.equal('end')

      callback()
    })
  })

  it('invalid header', function(callback) {
    var headersText = ' Key With Space : value'

    headerParser.parseHttpHeaders(headersText, function(err, headers) {
      should.exist(err)

      callback()
    })
  })
})

describe('parse request line test', function() {
  it('simple request line', function(callback) {
    var requestLineText = 'GET http://example.org/index.html HTTP/1.1'

    headerParser.parseHttpRequestLine(requestLineText, function(err, requestLine) {
      if(err) throw err

      requestLine.method.should.equal('GET')
      requestLine.uri.should.equal('http://example.org/index.html')
      requestLine.version.should.equal('HTTP/1.1')

      callback()
    })
  })
})

describe('parse response line test', function() {
  it('simple response line', function(callback) {
    var responseLineText = 'HTTP/1.1 200 OK'

    headerParser.parseHttpResponseLine(responseLineText, function(err, responseLine) {
      if(err) throw err

      responseLine.version.should.equal('HTTP/1.1')
      responseLine.statusCode.should.equal(200)
      responseLine.statusMessage.should.equal('OK')

      callback()
    })
  })
})
