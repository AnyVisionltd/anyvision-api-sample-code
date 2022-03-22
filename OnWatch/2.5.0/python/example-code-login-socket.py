import requests
import socketio
import json
import threading


# SERVER_IP = "kong.tls.ai" // REPLACE WITH SERVER IP OR RESOLVED DNS
SERVER_IP = "44.199.117.39" # REPLACE WITH SERVER IP OR RESOLVED DNS
USERNAME = "Administrator"
PASSWORD = "pa$$word!"

BASE_API_URL = f'https://{SERVER_IP}/bt/api'
HEADERS = {
    'accept': "application/json",
    'content-type': "application/json"
}

# add  verify=False this when running without certificate
response = requests.request('POST', f'{BASE_API_URL}/login',
                            headers=HEADERS,
                            json={'username': USERNAME, 'password': PASSWORD}, verify=False)
# token = 'Bearer' + response.json()['token'] # token header for future API requests
token = response.json()['token']
print(f'token: {token}')
querystring = {"offset": "0", "sortOrder": "desc", "limit": "10"}
HEADERS['authorization'] = f'Bearer {token}'
response = requests.request("GET", f'{BASE_API_URL}/roles', headers=HEADERS, params=querystring, verify=False)
print(response.text)

sio = socketio.Client(ssl_verify=False, logger=True, reconnection=True, engineio_logger=True)

@sio.on("connect")
def connect():
    print('connection established')

@sio.on("track:created")
def onTrakCreated(data):
    print(data)

@sio.on("disconnect")
def disconnect():
    print('disconnected from server')


def connect_to_socket_and_wait(token):
    try:
        sio.connect(url=f'https://{SERVER_IP}/?token={token}', socketio_path='/bt/api/socket.io')
        sio.wait()
    except:
        pass


# Socket Thread Runs as a Thread
socket_thread = threading.Thread(target=connect_to_socket_and_wait(token=token))
socket_thread.start()
# Main Thread Should be Running
while True:
    pass
