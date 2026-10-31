#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const MASTER_DIR = path.resolve(__dirname, '../samples/shorts_10eps/mastered');
const STATE_PATH = path.resolve(__dirname, '../samples/shorts_10eps/daily_send_state.json');

const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@kidsfit01';
const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/kids_fit1';

// 전편 해시태그 5개 이하 엄수 + 공식 유튜브(@kidsfit01) / 인스타(@kids_fit1) + 홈페이지 ?ep=N 자동 하이라이트 연동
const DAILY_EPISODES = [
  {
    ep: 1,
    file: 'ep01_newborn_sleep_combo2.mp4',
    label: '제1편 [2가지 꿀조합] 신생아 새벽 통잠 & 예쁜 두상 공식',
    ytTitle: '새벽마다 놀라 깨는 신생아, 딱 이 2가지만 세팅하세요! #신생아통잠 #스와들업 #두상베개 #출산준비',
    ytDesc:
`새벽마다 모로반사로 깜짝 놀라 깨는 아기 때문에 밤잠 설치셨나요?
조리원 퇴소 전 딱 이 2가지만 세팅해 주면 아기도 꿀잠 자고 엄마 아빠 아침 커피 타임이 생깁니다!

✅ [쇼츠 1편] 신생아 꿀잠 2종 꿀조합
1. 모로반사 숙면 방지 오가닉 순면 스와들업 속싸개 (28,500원)
2. 신생아 척추 보호 3D 통기성 에어메쉬 두상 베개 (34,000원)

👉 [쇼츠 1편] 상품 최저가 & 0원 무료체험 바로가기:
https://kidsfit.co.kr/?ep=1

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#신생아통잠 #스와들업 #아기두상베개 #출산준비물 #육아템추천`,
    reelsFull:
`[릴스 1편] 새벽마다 놀라 깨는 신생아, 딱 이 2가지만 세팅하세요! 🌙✨

조리원 퇴소하고 새벽마다 모로반사로 깨는 아기 때문에 힘드셨죠?
만세 자세로 감싸주는 '오가닉 스와들업 속싸개'와 태열을 싹 빼주는 '3D 에어메쉬 두상 베개' 꿀조합이면 눕히자마자 새벽 내내 통잠 자요!

📌 [릴스 1편] 꿀조합 2가지
① 모로반사 숙면 방지 오가닉 순면 스와들업 속싸개 (28,500원)
② 신생아 척추 보호 3D 통기성 에어메쉬 두상 베개 (34,000원)

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 1편] 탭을 누르시면 방금 보신 두 상품을 1초 만에 바로 확인하실 수 있어요!

#신생아통잠 #스와들업 #아기두상베개 #출산준비물 #육아템추천`
  },
  {
    ep: 2,
    file: 'ep02_baby_vitamind_drop1.mp4',
    label: '제2편 [1가지 단독집중] 신생아 비타민D + 배앓이 유산균 하루 1방울',
    ytTitle: '조리원 퇴소 후 영양제 딱 하나만 고른다면? 하루 1방울 비타민D+유산균 #아기비타민D #신생아유산균 #육아템',
    ytDesc:
`신생아 첫 영양제, 가루 날림 없이 하루 딱 한 방울이면 끝납니다!
비타민D3 400IU 일일 권장량에 배앓이 잡는 생유산균까지 한 방울에 쏙 담아 아기 배가 하루 종일 편안해요.

✅ [쇼츠 2편] 단독 집중 원픽 추천템
• 닥터에디션 베이비 비타민D3 400IU 드롭스 & 유산균 (26,400원)

👉 [쇼츠 2편] 상품 최저가 & 맞춤 영양제 바로가기:
https://kidsfit.co.kr/?ep=2

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#아기비타민D #신생아유산균 #배앓이유산균 #출산선물 #육아필수템`,
    reelsFull:
`[릴스 2편] 조리원 퇴소 후 아기 영양제 딱 하나만 고른다면? 💧✨

가루 섞을 필요 없이 하루 딱 1방울이면 끝!
일일 권장량 400IU 비타민D3와 배앓이 케어 생유산균이 한 병에 들어있어 신생아 첫 영양제로 가장 편하고 든든해요.

📌 [릴스 2편] 단독 원픽 추천템
• 닥터에디션 베이비 비타민D3 400IU 드롭스 & 유산균 (26,400원)

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 2편]을 누르시면 방금 보신 상품을 바로 만나보실 수 있어요!

#아기비타민D #신생아유산균 #배앓이유산균 #출산선물 #육아필수템`
  },
  {
    ep: 3,
    file: 'ep03_liquid_calcium_vs2.mp4',
    label: '제3편 [2가지 1:1 비교] 아기 액상 칼슘, 구연산 시럽 VS 차일드라이프',
    ytTitle: '돌 아기 액상 칼슘 둘 중 뭐 살까? 흡수율 대용량 VS 오렌지맛 직구템 #아기칼슘 #차일드라이프 #유아영양제',
    ytDesc:
`돌 지난 아기 첫 액상 칼슘, 어떤 걸 골라야 할지 고민되시죠? 딱 1:1로 정리해 드립니다!

✅ [쇼츠 3편] 액상 칼슘 1:1 비교
1. 속 편한 흡수율 + 정상 면역 아연까지 원한다면 👉 어린이 구연산 칼슘+비타민D3+아연 액상 시럽 (24,800원)
2. 약 거부 심한 아기 기호성이 1순위라면 👉 차일드라이프 액상 칼슘 마그네슘 천연 오렌지맛 (22,300원)

👉 [쇼츠 3편] 두 제품 한눈에 비교 & 최저가 바로가기:
https://kidsfit.co.kr/?ep=3

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#아기칼슘 #차일드라이프 #유아영양제 #돌아기영양제 #키즈핏`,
    reelsFull:
`[릴스 3편] 돌 지난 아기 액상 칼슘, 둘 중 뭐 살지 고민 끝! 🍊🥄

우리 아이 성향에 맞춰 딱 골라보세요:
✔️ 속 편한 흡수율과 아연까지 한 번에 챙기려면 👉 [어린이 구연산 칼슘+D3+아연 액상 시럽]
✔️ 약 거부 심한 아기 입맛 저격 1순위는 👉 [차일드라이프 액상 칼슘 마그네슘 천연 오렌지맛]

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 3편]을 누르시면 두 제품을 나란히 비교해 보실 수 있어요!

#아기칼슘 #차일드라이프 #유아영양제 #돌아기영양제 #육아템비교`
  },
  {
    ep: 4,
    file: 'ep04_toddler_walker_montessori2.mp4',
    label: '제4편 [2가지 꿀조합] 1~3세 대근육 걸음마 + 소근육 몬테소리 끝판왕',
    ytTitle: '돌 전후 1~3세 아기 대근육·소근육 발달 끝판왕 꿀조합 2가지! #걸음마학습기 #아기안전헬멧 #몬테소리교구',
    ytDesc:
`돌 전후 1~3세 영아기, 대근육 걸음마와 손끝 소근육 두뇌 발달을 동시에 잡아주는 베스트 꿀조합 2가지입니다!

✅ [쇼츠 4편] 영아기 발달 교구 2종 꿀조합
1. 성장기 바른 보행 걸음마 학습기 & 충격 흡수 유아 안전 헬멧 (38,000원)
2. 몬테소리 소근육 발달 원목 도형 맞추기 & 입체 비즈 롤러코스터 (23,500원)

👉 [쇼츠 4편] 상품 최저가 & 0원 무료체험 바로가기:
https://kidsfit.co.kr/?ep=4

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#걸음마학습기 #아기안전헬멧 #몬테소리교구 #돌아기장난감 #소근육발달`,
    reelsFull:
`[릴스 4편] 돌 전후 1~3세 아기 대근육·소근육 발달 끝판왕 꿀조합 2가지! 🧸🎈

쿵 넘어져도 머리 다칠 걱정 없는 [안전헬멧+걸음마 학습기]로 바른 보행 대근육을 길러주고,
[몬테소리 원목 도형 맞추기 & 비즈 롤러코스터]로 손끝 소근육과 공간감각을 쑥쑥 키워주세요!

📌 [릴스 4편] 꿀조합 2가지
① 바른 보행 걸음마 학습기 & 충격 흡수 안전 헬멧 (38,000원)
② 몬테소리 원목 도형 맞추기 & 입체 비즈 롤러코스터 (23,500원)

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 4편]을 누르시면 두 상품을 한눈에 확인하실 수 있어요!

#걸음마학습기 #아기안전헬멧 #몬테소리교구 #돌아기장난감 #소근육발달`
  },
  {
    ep: 5,
    file: 'ep05_silent_bungee_trampoline1.mp4',
    label: '제5편 [1가지 단독집중] 층간소음 0%! 집에서 키 크는 무소음 번지 트램폴린',
    ytTitle: '밤에 뛰어도 층간소음 0%! 성장판 자극하는 무소음 번지 트램폴린 #유아트램폴린 #키성장운동 #실내육아템',
    ytDesc:
`비 오는 날이나 미세먼지 심한 날, 집에서 층간소음 걱정 없이 키 크는 최고의 실내 운동템입니다!
삐걱대는 철제 스프링 대신 고탄성 번지코드를 사용해 밤에 뛰어도 조용하고 무릎 충격 없이 성장판만 수직 자극해 줍니다.

✅ [쇼츠 5편] 단독 집중 원픽 추천템
• 어린이 성장판 수직 자극 무소음 번지코드 트램폴린 (65,000원)

👉 [쇼츠 5편] 무소음 트램폴린 최저가 바로가기:
https://kidsfit.co.kr/?ep=5

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#유아트램폴린 #키성장운동 #실내육아템 #층간소음방지 #에너자이저육아`,
    reelsFull:
`[릴스 5편] 밤에 뛰어도 층간소음 걱정 끝! 집에서 키 크는 무소음 번지 트램폴린 🤸‍♂️✨

철제 스프링 대신 고탄성 번지코드와 방진 고무패드가 충격을 싹 흡수해 층간소음 걱정 없이 신나게 뛸 수 있어요!
안전 손잡이 잡고 점프하며 성장판은 자극하고 아이 에너지는 기분 좋게 방전시켜 보세요.

📌 [릴스 5편] 단독 원픽 추천템
• 어린이 성장판 수직 자극 무소음 번지코드 트램폴린 (65,000원)

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 5편]을 누르시면 바로 확인하실 수 있어요!

#유아트램폴린 #키성장운동 #실내육아템 #층간소음방지 #육아템추천`
  },
  {
    ep: 6,
    file: 'ep06_probiotics_vs_multigummy2.mp4',
    label: '제6편 [2가지 1:1 비교] 4~6세 면역 생유산균 스틱 VS 스마트팬츠 멀티구미',
    ytTitle: '4~6세 어린이집 면역 영양제 승자는? 초유 유산균 VS 멀티구미 #키즈유산균 #어린이영양제 #스마트팬츠',
    ytDesc:
`단체생활 시작하는 4~6세 유아기, 아침마다 챙겨 먹이기 좋은 영양제 2가지를 1:1로 비교했습니다!

✅ [쇼츠 6편] 4~6세 면역 영양제 1:1 비교
1. 장 면역 + 환절기 아연·초유 케어가 급하다면 👉 키즈 면역 생유산균 100억 CFU + 아연/초유 성장단 (29,900원)
2. 종합비타민 + 오메가3 DHA를 맛있게 먹이려면 👉 스마트팬츠 키즈 컴플리트 멀티구미 (31,500원)

👉 [쇼츠 6편] 두 제품 상세 비교 & 최저가 바로가기:
https://kidsfit.co.kr/?ep=6

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#키즈유산균 #어린이영양제 #스마트팬츠 #유아면역력 #어린이집준비물`,
    reelsFull:
`[릴스 6편] 4~6세 어린이집 등원 전, 우리 아이 면역 영양제 1:1 비교! 🍓🥛

✔️ 장 면역과 환절기 아연·초유 단백이 필요하다면 👉 [키즈 면역 생유산균 100억 + 아연/초유 스틱]
✔️ 종합비타민부터 오메가3 DHA까지 맛있게 씹어 먹이려면 👉 [스마트팬츠 키즈 멀티구미]

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 6편]을 누르시면 두 제품을 나란히 비교해 보실 수 있어요!

#키즈유산균 #어린이영양제 #스마트팬츠 #유아면역력 #어린이집준비물`
  },
  {
    ep: 7,
    file: 'ep07_magnetic_blocks_120p1.mp4',
    label: '제7편 [1가지 단독집중] 스마트폰 단번에 끊게 만든 3D 입체 자석블록 120P',
    ytTitle: '아이 스마트폰 단번에 끊게 만든 마법 교구! 3D 입체 자석블록 120P #자석블록 #창의력교구 #엄마표놀이',
    ytDesc:
`주말마다 스마트폰 찾는 아이, 이 교구 하나면 아빠랑 2시간 내내 초집중해서 놀아요!
강력한 자석으로 손끝에서 착착 붙고, 120피스 대용량이라 무너지지 않고 대형 입체 성까지 거뜬히 만듭니다.

✅ [쇼츠 7편] 단독 집중 원픽 추천템
• 두뇌 공간지각력 발달 3D 입체 자석 마그네틱 블록 120P (42,000원)

👉 [쇼츠 7편] 3D 자석블록 최저가 바로가기:
https://kidsfit.co.kr/?ep=7

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#자석블록 #창의력교구 #엄마표놀이 #유아장난감 #공간지각력`,
    reelsFull:
`[릴스 7편] 아이 스마트폰 단번에 끊게 만든 마법의 두뇌 교구! 🏰🌈

햇빛 비치면 스테인드글라스처럼 영롱한 [3D 입체 자석블록 120피스]!
평면 도형이 순식간에 입체로 변신하면서 아이의 공간지각력과 창의력이 폭발해요. 120피스 넉넉한 구성이라 온 가족이 함께 대형 성을 만들 수 있습니다.

📌 [릴스 7편] 단독 원픽 추천템
• 두뇌 공간지각력 발달 3D 입체 자석 마그네틱 블록 120P (42,000원)

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 7편]을 누르시면 바로 확인하실 수 있어요!

#자석블록 #창의력교구 #엄마표놀이 #유아장난감 #공간지각력`
  },
  {
    ep: 8,
    file: 'ep08_ergonomic_chair_bookstand1.mp4',
    label: '제8편 [1가지 단독집중] 초등 입학 전 거북목·척추 잡는 성장 의자 + 독서대',
    ytTitle: '책만 보면 구부정한 아이 거북목! 인체공학 성장의자+독서대로 해결 #초등책상의자 #거북목교정 #독서대',
    ytDesc:
`책만 펼치면 고개가 푹 숙여지는 우리 아이 거북목과 구부정한 허리, 공부 습관보다 바른 자세 세팅이 먼저입니다!
듀얼 등받이와 발받침이 허리와 다리를 90도로 잡아주고, 눈높이 원목 독서대가 시야를 편안하게 맞춰줍니다.

✅ [쇼츠 8편] 단독 집중 원픽 추천템
• 초등학생 인체공학 척추 지지 성장 의자 & 거북목 교정 독서대 (89,000원)

👉 [쇼츠 8편] 초등 공부방 필수템 최저가 바로가기:
https://kidsfit.co.kr/?ep=8

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#초등책상의자 #거북목교정 #독서대 #초등입학준비 #아이방꾸미기`,
    reelsFull:
`[릴스 8편] 책만 보면 고개 숙이는 우리 아이 거북목, 이렇게 잡아주세요! 🪑📖

듀얼 등받이와 높이조절 발받침이 아이 척추를 빈틈없이 받쳐주고,
45도 눈높이 각도조절 원목 독서대가 고개 숙일 일 없이 편안한 독서 자세를 만들어 줍니다. 오래 앉아도 지치지 않는 첫 공부방을 완성해 보세요!

📌 [릴스 8편] 단독 원픽 추천템
• 초등학생 인체공학 척추 지지 성장 의자 & 거북목 교정 독서대 (89,000원)

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 8편]을 누르시면 바로 확인하실 수 있어요!

#초등책상의자 #거북목교정 #독서대 #초등입학준비 #아이방꾸미기`
  },
  {
    ep: 9,
    file: 'ep09_elementary_growth_brain3.mp4',
    label: '제9편 [3가지 시너지] 초등 급성장기 키 성장 + 두뇌 집중력 3종 풀세트',
    ytTitle: '초등 급성장기 키+두뇌 동시에 잡는 3종 공식! 칼마디+오메가3+그래비트랙스 #초등영양제 #그래비트랙스 #키성장',
    ytDesc:
`초등 급성장기, 훌쩍 크는 키와 깊어지는 사고력을 동시에 채워주는 베스트 시너지 3종 세트입니다!

✅ [쇼츠 9편] 초등 키+두뇌 3종 풀세트
1. 청소년 급성장기 고함량 칼슘마그네슘 D3 K2 츄어블정 (34,500원)
2. 노르딕 네츄럴스 데일리 키즈 고순도 오메가3 DHA (37,800원)
3. 초등 과학탐구 전두엽 문제해결력 그래비트랙스 프로 스타터팩 (58,000원)

👉 [쇼츠 9편] 3종 풀세트 한눈에 보러가기:
https://kidsfit.co.kr/?ep=9

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#초등영양제 #그래비트랙스 #키성장영양제 #키즈오메가3 #초등선물`,
    reelsFull:
`[릴스 9편] 초등 급성장기, 키 성장과 두뇌 집중력을 동시에 잡는 3종 공식! 🚀🧠

① 뼈로 가는 고함량 [칼슘마그네슘 D3 K2 츄어블정]
② 두뇌 인지·집중력 [노르딕 네츄럴스 데일리 키즈 오메가3 DHA]
③ 중력과 가속도를 직접 설계하며 전두엽을 깨우는 [그래비트랙스 프로 스타터팩]

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 9편]을 누르시면 3종 풀세트를 한눈에 만나보실 수 있어요!

#초등영양제 #그래비트랙스 #키성장영양제 #키즈오메가3 #초등선물`
  },
  {
    ep: 10,
    file: 'ep10_free_trial_top4.mp4',
    label: '제10편 [4가지 총정리] 신청만 해도 100% 0원! 연령별 무료체험 4대장',
    ytTitle: '안 받으면 손해! 신청만 해도 100% 0원 연령별 무료체험 4대장 #무료체험 #웅진북클럽 #밀크T아이 #홈런',
    ytDesc:
`엄마들 사이에서 안 받으면 손해라고 소문난 연령별 100% 0원 무료체험 4대장을 총정리했습니다!

✅ [쇼츠 10편] 연령별 0원 무료체험 4대장
1. [0~1세 신생아] 웅진북클럽 베이비 첫 그림책 & 오감 발달 무료체험 (0원)
2. [1~3세 영아기] 한솔교육 핀덴베베 말놀이 그림책 체험팩 & 발달상담 키트 (0원)
3. [4~6세 유아기] 천재교육 밀크T 아이 유아 전과목 AI 학습기 7일 무료체험 (0원)
4. [7~12세 초등] 아이스크림 홈런 초등 문해력·독해력 10일 무료체험 (0원)

👉 [쇼츠 10편] 연령별 0원 무료체험 통합 신청하기:
https://kidsfit.co.kr/?ep=10

📺 키즈핏 공식 유튜브 구독: https://www.youtube.com/@kidsfit01
📸 키즈핏 공식 인스타그램: https://www.instagram.com/kids_fit1

#유아무료체험 #웅진북클럽 #핀덴베베 #밀크T아이 #아이스크림홈런`,
    reelsFull:
`[릴스 10편] 안 받으면 손해! 신청만 해도 100% 0원인 연령별 무료체험 4대장 총정리 🎁✨

우리 아이 나이에 맞는 혜택을 0원으로 챙겨보세요:
👶 [0~1세] 웅진북클럽 베이비 첫 오감 그림책 무료체험 (0원)
🧒 [1~3세] 한솔교육 핀덴베베 말놀이 그림책 체험팩 (0원)
👧 [4~6세] 천재교육 밀크T 아이 AI 놀이학습기 7일 무료체험 (0원)
🧑 [7~12세] 아이스크림 홈런 초등 문해력·전과목 10일 무료체험 (0원)

🛍️ @kids_fit1 프로필 링크(kidsfit.co.kr)에서 [🎬 쇼츠·릴스 10편]을 누르시면 4가지 모두 0원으로 바로 신청하실 수 있습니다!

#유아무료체험 #웅진북클럽 #핀덴베베 #밀크T아이 #아이스크림홈런`
  }
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sendVideoMultipart(filePath, caption) {
  return new Promise((resolve, reject) => {
    const boundary = '----KidsFitBoundary' + Date.now().toString(16);
    const filename = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);

    const parts = [];
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${CHAT_ID}\r\n`));
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="supports_streaming"\r\n\r\ntrue\r\n`));
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="width"\r\n\r\n1080\r\n`));
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="height"\r\n\r\n1920\r\n`));
    if (caption) {
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`));
    }
    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="video"; filename="${filename}"\r\nContent-Type: video/mp4\r\n\r\n`
    ));
    parts.push(fileData);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const body = Buffer.concat(parts);
    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendVideo`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      },
      timeout: 180000
    }, (res) => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(chunks));
        } catch (e) {
          resolve({ ok: false, raw: chunks });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sendHtmlMessage(htmlText) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: CHAT_ID,
      text: htmlText,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 30000
    }, (res) => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => {
        try {
          resolve(JSON.parse(chunks));
        } catch (e) {
          resolve({ ok: false, raw: chunks });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function loadState() {
  if (fs.existsSync(STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    } catch (e) {}
  }
  return { next_ep: 1, history: [] };
}

function saveState(st) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(st, null, 2), 'utf8');
}

(async () => {
  const argEp = Number(process.argv[2]);
  const state = loadState();
  const targetEp = (argEp >= 1 && argEp <= 10) ? argEp : state.next_ep;

  if (targetEp > 10) {
    console.log('All 10 episodes have already been sent in the daily queue!');
    process.exit(0);
  }

  const item = DAILY_EPISODES.find(x => x.ep === targetEp);
  if (!item) {
    console.error(`Episode ${targetEp} not found.`);
    process.exit(1);
  }

  const videoPath = path.join(MASTER_DIR, item.file);
  if (!fs.existsSync(videoPath)) {
    console.error(`Video file missing: ${videoPath}`);
    process.exit(1);
  }

  console.log(`Sending Daily 6AM Package for Episode ${item.ep}: ${item.label}...`);

  // 1. 영상 파일 전송 + 유튜브(@kidsfit01) / 인스타(@kids_fit1) 바로가기 안내
  const videoCaption =
    `🌅 [아침 6시 데일리 숏폼 발송 · ${item.ep}/10편]\n` +
    `${item.label}\n\n` +
    `📺 업로드 유튜브: ${YOUTUBE_CHANNEL_URL}\n` +
    `📸 업로드 인스타: ${INSTAGRAM_PROFILE_URL}\n` +
    `🔗 전용 랜딩링크: https://kidsfit.co.kr/?ep=${item.ep}\n\n` +
    `👇 아래 3개 메시지(① 유튜브 제목 / ② 유튜브 설명글 / ③ 릴스 전체글)의 코드박스를 터치하면 1초 만에 복사됩니다!`;
  const vRes = await sendVideoMultipart(videoPath, videoCaption);
  if (!vRes.ok) {
    console.error('Failed to send video:', vRes);
    process.exit(1);
  }

  // 2. 유튜브 쇼츠 [제목] 따로 전송 (해시태그 4개 이하)
  const msgYtTitle =
    `🔴 <b>[1/3] 유튜브 쇼츠 제목 (@kidsfit01)</b> — 아래 박스 터치 시 바로 복사\n` +
    `<pre>${escapeHtml(item.ytTitle)}</pre>`;
  await sendHtmlMessage(msgYtTitle);

  // 3. 유튜브 쇼츠 [설명글 & 고정댓글] 따로 전송 (해시태그 5개 이하)
  const msgYtDesc =
    `🟠 <b>[2/3] 유튜브 쇼츠 설명글 &amp; 고정댓글 (@kidsfit01)</b> — 아래 박스 터치 시 바로 복사\n` +
    `<pre>${escapeHtml(item.ytDesc)}</pre>`;
  await sendHtmlMessage(msgYtDesc);

  // 4. 인스타그램 릴스 [전체 본문] 통합 전송 (해시태그 5개 이하)
  const msgReels =
    `🟣 <b>[3/3] 인스타그램 릴스 전체 본문 (@kids_fit1)</b> — 아래 박스 터치 시 바로 복사\n` +
    `<pre>${escapeHtml(item.reelsFull)}</pre>`;
  await sendHtmlMessage(msgReels);

  // 상태 업데이트 (다음 날 아침 6시에는 다음 편 발송)
  state.history = state.history || [];
  state.history.push({
    ep: item.ep,
    sent_at: new Date().toISOString(),
    video_msg_id: vRes.result && vRes.result.message_id
  });
  if (!argEp) {
    state.next_ep = item.ep + 1;
  }
  saveState(state);
  console.log(`✅ Daily 6AM Episode ${item.ep} package sent! Next scheduled episode: ${state.next_ep}`);
})();
