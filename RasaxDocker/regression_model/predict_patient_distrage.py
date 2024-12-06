import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import joblib

# Charger les données
file_path = 'data.csv'  # Chemin vers le fichier CSV

# Charger le fichier CSV
data = pd.read_csv(file_path)

# Sélectionner les colonnes pertinentes pour la modélisation
X = data[['age', 'sys_blood_pressure', 'dys_blood_pressure', 'thrombolysis', 'cholesterol', 'nihss_score']]
y = data['distrage_mrs']

# Créer un nouveau modèle de régression linéaire
model = LinearRegression()

# Diviser les données en ensembles d'entraînement et de test (20% pour le test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Entraîner le modèle sur les données d'entraînement
model.fit(X_train, y_train)

# Sauvegarder le modèle entraîné
joblib.dump(model, 'new_linear_regression_model.pkl')

# Prédire le distrage_mrs pour un patient spécifique (exemple : patient avec subject_id = 1)
subject_id = 1  # Exemple d'ID de patient

# Trouver les caractéristiques du patient spécifique
subject_data = data[data['subject_id'] == subject_id][['age', 'sys_blood_pressure', 'dys_blood_pressure', 'thrombolysis', 'cholesterol', 'nihss_score']]

# Vérifier si le patient existe dans le jeu de données
if not patient_data.empty:
    # Prédire la sortie pour ce patient
    prediction = model.predict(subject_data)
    print(f"Prédiction de distrage_mrs pour le patient {subject_id} : {prediction[0]:.2f}")
else:
    print(f"Le patient avec subject_id {subject_id} n'a pas été trouvé dans les données.")