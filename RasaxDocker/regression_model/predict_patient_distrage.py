import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib

# Load the data
file_path = 'data.csv'  # Path to the CSV file

# Load the CSV file
data = pd.read_csv(file_path)

# Select relevant columns for modeling
X = data[['age', 'sys_blood_pressure', 'dys_blood_pressure', 'thrombolysis', 'cholesterol', 'nihss_score']]
y = data['distrage_mrs']

# Create a new linear regression model
model = LinearRegression()

# Split the data into training and testing sets (20% for testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model on the training data
model.fit(X_train, y_train)

# Save the trained model
joblib.dump(model, 'new_linear_regression_model.pkl')

# Predict the distrage_mrs for a specific patient (example: patient with subject_id = 1)
subject_id = 1  # Example of a patient ID

# Find the features of the specific patient
subject_data = data[data['subject_id'] == subject_id][['age', 'sys_blood_pressure', 'dys_blood_pressure', 'thrombolysis', 'cholesterol', 'nihss_score']]

# Check if the patient exists in the dataset
if not subject_data.empty:  # Replace `patient_data` with `subject_data`
    # Predict the output for this patient
    prediction = model.predict(subject_data)
    print(f"Prediction of distrage_mrs for patient {subject_id}: {prediction[0]:.2f}")
else:
    print(f"The patient with subject_id {subject_id} was not found in the data.")


