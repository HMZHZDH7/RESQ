## Test prediction flow
* ask_prediction
  - action_ask_age
* provide_age{"age": 60}
  - action_ask_sys_blood_pressure
* provide_sys_blood_pressure{"sys_blood_pressure": 120}
  - action_ask_dys_blood_pressure
* provide_dys_blood_pressure{"dys_blood_pressure": 80}
  - action_predict_distrage_mrs
  - utter_result_prediction{"distrage_mrs": "2"}
