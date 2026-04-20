from fastapi import Header

def get_lang(accept_language: str = Header("fr")):
    if accept_language and "ar" in accept_language:
        return "ar"
    return "fr"