import requests
import os
from PIL import Image

# JSONデータのURL
json_char = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json'
json_loc = 'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/loc.json'

# JSONデータを取得
characters = requests.get(json_char).json()
loc = requests.get(json_loc).json()

# Hashからキャラ名を取得する関数
def get_name_from_hash(hash, lang):
    try:
        return loc[lang].get(str(hash))
    except:
        return "Unknown"

def get_character_data(characters):
    character_data = []
    for char_id, char_info in characters.items():
        name_hash = char_info.get("NameTextMapHash")
        character_name = get_name_from_hash(name_hash, 'ja')
        side_icon_name = char_info.get("SideIconName")
        skills = char_info.get("Skills", {})
        
        character_data.append({
            "id": char_id,
            "name": character_name,
            "side_icon_name": side_icon_name,
            "skills": skills
        })
    return character_data

def create_output_dir(output_dir):
    os.makedirs(output_dir, exist_ok=True)

def download_skill_images(character_data, output_dir):
    for char in character_data:
        skills = char['skills']
        for skill_id, skill_name in skills.items():
            skill_image_url = f'https://enka.network/ui/{skill_name}.png'
            
            # URLが有効かどうかを確認
            response = requests.get(skill_image_url)
            if response.status_code == 200:
                # ファイルを保存
                with open(os.path.join(output_dir, f'{skill_name}.png'), 'wb') as f:
                    f.write(response.content)
                    print(f'Downloaded {skill_name}')
            else:
                print(f'Failed to download {skill_image_url}')

def main(characters):
    character_data = get_character_data(characters)
    output_dir = './skills'
    create_output_dir(output_dir)
    download_skill_images(character_data, output_dir)
    print("All skill images have been downloaded.")

if __name__ == "__main__":
    # 使用例
    characters = {
        # キャラクターデータをここに定義
    }
    main(characters)