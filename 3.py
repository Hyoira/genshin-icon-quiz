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
        consts = char_info.get("Consts", [])
        
        character_data.append({
            "id": char_id,
            "name": character_name,
            "side_icon_name": side_icon_name,
            "skills": skills,
            "consts": consts
        })
    return character_data

def create_output_dir(output_dir):
    os.makedirs(output_dir, exist_ok=True)

def download_images(character_data, output_dir, image_type):
    for char in character_data:
        if image_type == 'skill':
            skills = char['skills']
            for skill_id, skill_name in skills.items():
                if skill_name.startswith('Skill_S_'):
                    download_image(skill_name, output_dir)
        elif image_type == 'burst':
            skills = char['skills']
            for skill_id, skill_name in skills.items():
                if skill_name.startswith('Skill_E_'):
                    download_image(skill_name, output_dir)
        elif image_type == 'const':
            consts = char['consts']
            for const_name in consts:
                if const_name.startswith('UI_Talent_S_'):
                    download_image(const_name, output_dir)

def download_image(image_name, output_dir):
    skill_image_url = f'https://enka.network/ui/{image_name}.png'
    response = requests.get(skill_image_url)
    if response.status_code == 200:
        with open(os.path.join(output_dir, f'{image_name}.png'), 'wb') as f:
            f.write(response.content)
            print(f'Downloaded {image_name}')
    else:
        print(f'Failed to download {skill_image_url}')

def main(characters):
    character_data = get_character_data(characters)
    output_dir_skill = './assets/skills'
    output_dir_burst = './assets/bursts'
    output_dir_consts = './assets/consts'

    create_output_dir(output_dir_skill)
    create_output_dir(output_dir_burst)
    create_output_dir(output_dir_consts)

    download_images(character_data, output_dir_skill, 'skill')
    download_images(character_data, output_dir_burst, 'burst')
    download_images(character_data, output_dir_consts, 'const')

if __name__ == "__main__":
    characters = requests.get(json_char).json()  # characters.jsonのデータをここに読み込む
    main(characters)