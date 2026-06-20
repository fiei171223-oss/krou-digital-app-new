import requests

# ការកំណត់ Token និង Chat ID
BOT_TOKEN = "8960842446:AAGgcFGqwEREztuOS4n3GtQdhy1EnseTmjk"
CHAT_ID = "" # ទុកឱ្យទំនេរសិន ដរាបណាអ្នកមិនទាន់បានរកឃើញ ID របស់អ្នក

def send_telegram_message(message_text):
    """
    សម្រាប់ផ្ញើសារទៅកាន់ Telegram Group តាមរយៈ Bot API
    """
    if not CHAT_ID:
        print("បរាជ័យ៖ សូមបំពេញ CHAT_ID ជាមុនសិន។")
        return False
        
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": message_text
    }
    
    try:
        response = requests.post(url, json=payload)
        
        # ត្រួតពិនិត្យមើលថាតើ Error ឬជោគជ័យ
        if response.status_code == 200:
            print("សារត្រូវបានផ្ញើដោយជោគជ័យ!")
            return True
        else:
            print(f"បរាជ័យក្នុងការផ្ញើសារ! លេខកូដបញ្ហាប្រភេទ (Error): {response.status_code}")
            print(f"ព័ត៌មានលម្អិត៖ {response.json().get('description')}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"មានបញ្ហាក្នុងការតភ្ជាប់អ៊ីនធឺណិត ឬ API៖ {e}")
        return False

# ឧទាហរណ៍នៃការប្រើប្រាស់ (អ្នកអាចសាកល្បងដោយលុបសញ្ញា # នេះចេញ)
# send_telegram_message("សួស្តីតើអ្នកសុខសប្បាយជាទេ?")
