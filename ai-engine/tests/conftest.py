import os

# Harus diatur sebelum app.main diimpor (main menolak jalan tanpa AI_API_KEY).
os.environ["AI_API_KEY"] = "test-key"
os.environ["GROQ_API_KEY"] = "g"
os.environ["GEMINI_API_KEY"] = "m"
# Rantai pendek yang dipakai sebagian besar tes; tes rantai default menghapus variabel ini.
os.environ["AI_PROVIDERS"] = "groq,gemini"
os.environ["GROQ_MODEL"] = "test"
os.environ["GEMINI_MODEL"] = "test"


def fake(responses, calls=None):
    """Mengganti pemanggilan penyedia. Kunci "provider:model" atau "provider"; nilainya teks jawaban atau galat.
    Bila calls diberikan, setiap percobaan dicatat sebagai "provider:model"."""
    async def call(name, model, system, user, timeout=None):
        key = f"{name}:{model}"
        if calls is not None:
            calls.append(key)
        r = responses.get(key, responses.get(name))
        if isinstance(r, Exception):
            raise r
        return r, key
    return call
