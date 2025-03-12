from flask import Flask, redirect, url_for, render_template, jsonify,request
app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/subjects")
def subjects():
    return render_template("subjects.html")

@app.route("/sections")
def sections():
    return render_template("sections.html")

@app.route("/preferences")
def preferences():
    return render_template("preferences.html")

@app.route("/timetables")
def timetables():
    return render_template("timetables.html")


#///////////////////////////////////

# Endpoint to generate timetable data


@app.route('/generate-timetable', methods=['POST'])
def generate_timetable():
    # Get user inputs from the request
    user_data = request.get_json()
    subjects = user_data.get("subjects", [])
    schedules = user_data.get("schedules", {})

    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"]
    times = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

    # Generate timetable data using user inputs
    timetable_data = {
        "days": days,
        "times": times,
        "subjects": subjects,
        "schedules": schedules
    }

    return jsonify(timetable_data)

if __name__ == '__main__':
    app.run(debug=True)