import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt
from sklearn.metrics import make_scorer, mean_squared_error
from sklearn.metrics import r2_score
import logging
import joblib

# Load the data
data = pd.read_csv('dataREanonymized_long.csv')

# Select the predictive variables and the target
X = data[['age', 'sys_blood_pressure', 'dys_blood_pressure', 'thrombolysis', 'cholesterol', 'nihss_score']]
y = data['distrage_msp']

# Create a linear regression model
model = LinearRegression()

# Perform cross-validation (5-fold cross-validation in this example)
# Using 'neg_mean_squared_error' to get MSE scores (negative because cross_val_score expects higher values to be better)
scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_squared_error')

# Calculate the mean and standard deviation of the scores
mean_score = -scores.mean()  # Convert negative MSE back to positive
std_score = scores.std()

print(f"Mean Squared Error (MSE): {mean_score}")
print(f"Standard Deviation of MSE: {std_score}")

# Split the data into training and testing sets (for visualization purposes)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model on the full training data
model.fit(X_train, y_train)

-
# Save the trained model to a file
joblib.dump(model, 'linear_regression_model.pkl')
print("Model saved successfully.")
-

# Predict the values for the test set
y_pred = model.predict(X_test)

# Plot the results
plt.scatter(y_test, y_pred)
plt.plot([y.min(), y.max()], [y.min(), y.max()], color='red', lw=2)
plt.xlabel('Actual Values')
plt.ylabel('Predicted Values')
plt.title('Linear Regression - Prediction of distrage_msp')
plt.show()

# Plot the results
plt.figure(figsize=(10, 6))
plt.plot(range(1, 6), -scores, marker='o', linestyle='--', color='b')
plt.xlabel('Fold Number')
plt.ylabel('Mean Squared Error')
plt.title('Cross-Validation MSE for Each Fold')
plt.show()


# R^2 calculation on the test set
r2 = r2_score(y_test, y_pred)
response += f"\nCoefficient of Determination (R^2): {r2:.2f}"


# R^2 calculation on the test set
r2 = r2_score(y_test, y_pred)
print(f"Coefficient of Determination (R^2): {r2:.2f}")

-
# Log the cross-validation results
logging.basicConfig(filename='cross_validation_results.log', level=logging.INFO)
logging.info(f"Cross-validation scores: {scores}")
logging.info(f"Mean MSE: {mean_score:.2f}")
logging.info(f"Standard Deviation of MSE: {std_score:.2f}")
-




def train_model():
    df = pd.read_csv('data/dataREanonymized.csv')  # path
    features = ['age', 'sys_blood_pressure', 'dys_blood_pressure', 'thrombolysis', 'cholesterol', 'nihss_score']
    target = 'distrage_mrs'
    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LinearRegression()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(f"Mean squared error: {mean_squared_error(y_test, y_pred)}")

    joblib.dump(model, 'models/regression_model.pkl')  # save the model
    print("Model saved to 'models/regression_model.pkl'")

def predict_distrage_mrs(input_data):
    model = joblib.load('models/regression_model.pkl')  # load the model
    prediction = model.predict([input_data])
    return prediction[0]