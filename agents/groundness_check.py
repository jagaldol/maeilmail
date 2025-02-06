from openai import OpenAI


def check_groundness(context: str, answer: str, api_key) -> str:
    client = OpenAI(api_key=api_key, base_url="https://api.upstage.ai/v1/solar")
    response = client.chat.completions.create(
        model="groundedness-check",
        messages=[
            {
                "role": "user",
                "content": context,
            },
            {"role": "assistant", "content": answer},
        ],
    )

    groundness = response.choices[0].message.content
    token_usage = response.usage.total_tokens
    return groundness, token_usage
