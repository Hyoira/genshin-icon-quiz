import requests

# JSONデータのURL
json_char = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json'
json_loc = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/loc.json'

# JSONデータをダウンロードしてファイルに保存する関数
def download_json(url, filename):
    response = requests.get(url)
    if response.status_code == 200:
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(response.text)
        print(f'{filename} に保存しました。')
    else:
        print(f'エラー: {url} からデータを取得できませんでした。ステータスコード: {response.status_code}')

# JSONデータを保存
download_json(json_char, 'characters.json')
download_json(json_loc, 'loc.json')