# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []

from pymongo import MongoClient
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from datetime import datetime

class ActionSaveConversation(Action):
    def name(self):
        return "action_save_conversation"

    def run(self, dispatcher, tracker: Tracker, domain):
        client = MongoClient("mongodb+srv://zeyadunw2:8KFwlezTWwBV1bfN@firstaidbot.iu2w7l5.mongodb.net/")
        db = client["firstaidbot"]
        collection = db["rasa_bot"]  

        user_input = tracker.latest_message.get('text')

        bot_response = dispatcher.latest_message['text']
        
        conversation = {
            "user_input": user_input,
            "bot_response": bot_response,
            "timestamp": datetime.now() 
        }
        
        collection.insert_one(conversation)

        return []
from pymongo import MongoClient






