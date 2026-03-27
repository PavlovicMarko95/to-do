from flask import Flask, request, jsonify, render_template
import json
from flask_cors import CORS #ovo na zadnje i radilo je

app = Flask(__name__)
FILE = "todos.json"
CORS(app)

def load_todos():
    try:
        with open(FILE, "r") as f:
            return json.load(f)
    except:
        return []
    
def save_todos(todos):
    with open(FILE, "w") as f:
        json.dump(todos, f, indent=4)

@app.route("/")
def index():
    return render_template("index.html")

#GET
@app.route("/api", methods=["GET"])
def get_todos():
    return jsonify(load_todos())

# POST (add)
@app.route("/api", methods=["POST"])
def add_todo():
    data = request.json
    print("Primljeni JSON:", data) # ovo je debug
    if not data:
        return jsonify({"status": "error", "message": "No data received"}), 400
    todos = load_todos()
    todos.append(data)
    save_todos(todos)
    return jsonify({"status": "ok"})

#delete
@app.route("/api/<id>", methods=["DELETE"])
def delete_todo(id):
    todos = load_todos()
    todos = [t for t in todos if t["id"] != id]
    save_todos(todos)
    return jsonify({"status": "deleted"})

# TOGGLE
@app.route("/api/<id>", methods=["PUT"])
def toggle_todo(id):
    todos = load_todos()

    for t in todos:
        if t["id"] == id:
            t["completed"] = not t["completed"]
    
    save_todos(todos)
    return jsonify({"status": "toggled"})

if __name__ == "__main__":
    app.run(debug=True)

