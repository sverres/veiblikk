  
import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

print()
print( " -----------------------------------------------------------")
print( " web server started for this folder at http://localhost:8000")
print( " -----------------------------------------------------------")
print() 

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()
