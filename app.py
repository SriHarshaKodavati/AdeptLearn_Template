
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

app = Flask(__name__)
CORS(app)

class AdaptiveELearningModel:
    def __init__(self):
        self.user_classifier = Pipeline([
            ('scaler', StandardScaler()),
            ('rf', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        
        self.module_skip_classifier = Pipeline([
            ('scaler', StandardScaler()),
            ('mlp', MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=1000, random_state=42))
        ])
    
    def train_models(self):
        X_users = np.random.rand(1000, 5) 
        y_users = np.random.choice(['basic', 'intermediate', 'advanced'], 1000)
        
        X_modules = np.random.rand(1000, 6)  
        y_modules = np.random.choice([0, 1], 1000)
        
        self.user_classifier.fit(X_users, y_users)
        self.module_skip_classifier.fit(X_modules, y_modules)
    
    def classify_user(self, user_features):
        return self.user_classifier.predict([user_features])[0]
    
    def can_skip_module(self, module_features):
        return bool(self.module_skip_classifier.predict([module_features])[0])

model = AdaptiveELearningModel()
model.train_models()

@app.route('/classify_user', methods=['POST'])
def classify_user():
    data = request.json
    user_features = [
        data['time_taken'],
        data['score'],
        data['avg_time_per_question'],
        data['difficulty'],
        data['attempts']
    ]
    
    if data['score'] == 100:
        classification = 'advanced'
        can_skip = True
    else:
        classification = model.classify_user(user_features)
        
        user_level = {'basic': 1, 'intermediate': 2, 'advanced': 3}[classification]
        
        module_features = [
            user_level,
            3,  
            data['score'], 
            data['time_taken'],
            data['score'],
            0.8 
        ]
        can_skip = model.can_skip_module(module_features)
    
    return jsonify({
        'classification': classification,
        'can_skip': can_skip,
        'explanation': f"Based on your score of {data['score']}% and time taken of {data['time_taken']} seconds."
    })
    data = request.json
    user_features = [
        data['time_taken'],
        data['score'],
        data['avg_time_per_question'],
        data['difficulty'],
        data['attempts']
    ]
    classification = model.classify_user(user_features)
    
    user_level = {'basic': 1, 'intermediate': 2, 'advanced': 3}[classification]
    
    module_features = [
        user_level,
        3,  
        data['score'],  
        data['time_taken'],
        data['score'],
        0.8  
    ]
    can_skip = model.can_skip_module(module_features)
    
    return jsonify({
        'classification': classification,
        'can_skip': can_skip
    })

if __name__ == '__main__':
    app.run(debug=True)