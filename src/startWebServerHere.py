#!/usr/bin/env python
import SimpleHTTPServer
import SocketServer

class MyHTTPRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_my_headers()
        SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

Handler = SimpleHTTPServer.HandlerClass=MyHTTPRequestHandler
server = SocketServer.TCPServer(('127.0.0.1', 8000), Handler)

print
print " web server started for this folder at http://localhost:8000"
print
print " -----------------------------------------------------------"
print " * https://github.com/sverres/snippets"
print " * 11.11.2016"
print " -----------------------------------------------------------"
print 

server.serve_forever()