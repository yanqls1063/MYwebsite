const express = require("express");
const OpenAI = require("openai");

const app = express();
const port = 3000;

// OpenAI 클라이언트
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static("public"));

// 서버 체크용
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ✅ AI가 종 1개 뽑아주는 API
app.post("/api/species", async (req, res) => {
  try {
    const response = await client.responses.create({
      model: "gpt-5",
      reasoning: { effort: "low" },
      store: false,
      instructions:
        "너는 생존 시뮬레이션 게임 GM이다. " +
        "현실의 생물(동물/식물/균류/미생물) 중 하나를 무작위로 선택하고, 반드시 JSON만 출력해라. " +
        "가상/신화 생물 금지.",
      input: [
        {
          role: "user",
          content:
            "아래 스키마의 JSON만 출력해. JSON 외 텍스트 금지.\n" +
            "{\n" +
            '  "name_ko": "한국어 이름",\n' +
            '  "name_en": "English name",\n' +
            '  "category": "animal|plant|fungus|microbe",\n' +
            '  "rarity": "common|uncommon|rare",\n' +
            '  "traits": ["특성1","특성2","특성3"],\n' +
            '  "weaknesses": ["약점1","약점2"],\n' +
            '  "starter_goal": "초반 목표 1문장",\n' +
            '  "starter_tip": "초반 생존 팁 1문장"\n' +
            "}"
        }
      ]
    });

    const text = response.output_text;
    const species = JSON.parse(text);

    res.json({ ok: true, species });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "species_generation_failed" });
  }
});

app.listen(port, () => {
  console.log(`✅ http://localhost:${port} 에서 실행 중`);
});
