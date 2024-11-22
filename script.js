// JSONデータを読み込む
async function loadData() {
    const charactersResponse = await fetch('./characters.json');
    const locResponse = await fetch('./loc.json');
    const charactersData = await charactersResponse.json();
    const locData = await locResponse.json();

    // キャラクターデータを整形する
    const characters = {};
    Object.keys(charactersData).forEach(charId => {
        const charInfo = charactersData[charId];
        const nameHash = charInfo.NameTextMapHash;
        const characterName = locData.ja[nameHash];
        const skills = charInfo.Skills;

        Object.keys(skills).forEach(skillId => {
            const skillName = skills[skillId];
            characters[skillName] = {
                name: characterName,
                skillType: skillName.includes('Skill_E') ? '元素爆発' : '元素スキル'
            };
        });
    });

    // スキル画像データを設定する
    const skillImages = {};
    Object.keys(characters).forEach(skillName => {
        skillImages[skillName] = `./skills/${skillName}.png`;
    });

    const excludedCharacters = ['マーヴィカ', '旅人']; // 除外するキャラクター名を部分一致で追加

    document.getElementById('start-button').addEventListener('click', startQuiz);

    let correctCount = 0;
    let questionCount = 0;
    const totalQuestions = 5; // クイズの総問題数

    function startQuiz() {
        correctCount = 0;
        questionCount = 0;
        const selectedMode = document.querySelector('input[name="mode"]:checked').value;
        document.getElementById('mode-selection').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('end-screen').style.display = 'none'; // 終了画面を非表示
        document.getElementById('back-to-start-button').style.display = 'block'; // 「スタートに戻る」ボタンを表示
        updateProgress(); // 初期状態で進捗をリセット
        loadQuestion(selectedMode);
    }

    function loadQuestion(mode) {
        if (questionCount >= totalQuestions) {
            endQuiz();
            return;
        }
        questionCount++;
        const result = document.getElementById('result');
        result.textContent = ''; // 結果表示をクリア

        const skillKeys = Object.keys(skillImages).filter(skillName => {
            const character = characters[skillName];
            if (excludedCharacters.some(excluded => character.name.includes(excluded))) return false; // 部分一致で除外キャラクターをフィルタリング
            if (mode === 'skill') return character.skillType === '元素スキル';
            if (mode === 'burst') return character.skillType === '元素爆発';
            return true; // 'all' モード
        });

        const randomSkillKey = skillKeys[Math.floor(Math.random() * skillKeys.length)];
        const skillImage = skillImages[randomSkillKey];
        const correctCharacter = characters[randomSkillKey];

        document.getElementById('skill-icon').src = skillImage;

        const choices = generateChoices(correctCharacter);
        displayChoices(choices, correctCharacter);
        updateProgress();
    }

    function generateChoices(correctCharacter) {
        const choices = [correctCharacter];
        const characterNames = Object.values(characters).map(character => character.name);

        while (choices.length < 5) {
            const randomCharacterName = characterNames[Math.floor(Math.random() * characterNames.length)];
            const randomCharacter = Object.values(characters).find(character => character.name === randomCharacterName);

            if (!choices.some(choice => choice.name === randomCharacter.name)) {
                choices.push(randomCharacter);
            }
        }
        return choices.sort(() => Math.random() - 0.5); // 選択肢をランダムに並べ替え
    }

    function displayChoices(choices, correctCharacter) {
        const choicesContainer = document.getElementById('choices-container');
        choicesContainer.innerHTML = ''; // 既存の選択肢をクリア

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.name;
            button.className = 'choice-btn'; // 新しいクラスを適用
            button.addEventListener('click', () => {
                checkAnswer(choice, correctCharacter);
                disableChoices(); // 選択肢を無効化
            });
            choicesContainer.appendChild(button);
        });
    }

    function disableChoices() {
        const buttons = document.querySelectorAll('.choice-btn');
        buttons.forEach(button => {
            button.disabled = true;
        });
    }

    function checkAnswer(selectedCharacter, correctCharacter) {
        const result = document.getElementById('result');
        if (selectedCharacter.name === correctCharacter.name) {
            result.textContent = `正解！ ${correctCharacter.name}の${correctCharacter.skillType}です。`;
            correctCount++;
        } else {
            result.textContent = `不正解。正解は${correctCharacter.name}の${correctCharacter.skillType}です。`;
        }
        setTimeout(() => loadQuestion(document.querySelector('input[name="mode"]:checked').value), 2000); // 2秒後に次の問題を読み込む
        updateProgress();
    }

    function updateProgress() {
        const progress = document.getElementById('progress');
        const progressBar = document.getElementById('progress-bar');
        const score = document.getElementById('score');
        progress.style.width = `${(questionCount / totalQuestions) * 100}%`;
        score.textContent = `正解数: ${correctCount}`;
    }

    function endQuiz() {
        const result = document.createElement('div');
        result.innerHTML = `
            <h2>クイズ終了！</h2>
            <p>あなたの正解数は ${correctCount} / ${totalQuestions} です。</p>
        `;
        document.getElementById('end-screen').style.display = 'block'; // 終了画面を表示
        const endScreen = document.getElementById('end-screen');
        endScreen.innerHTML = ''; // 終了画面をクリア
        endScreen.appendChild(result);
    }

    document.getElementById('back-to-start-button').addEventListener('click', () => {
        document.getElementById('mode-selection').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('end-screen').style.display = 'none';
        document.getElementById('result').innerHTML = ''; // 結果表示をクリア
        document.getElementById('back-to-start-button').style.display = 'none'; // 「スタートに戻る」ボタンを非表示
    });
}

loadData();