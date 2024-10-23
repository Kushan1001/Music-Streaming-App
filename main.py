from flask import Flask
from application.model import db, User, Role
from flask_security import Security
from application.security import user_datastore
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from application.tasks import daily_reminder, montly_report

# setting up the app
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.sqlite3'
app.config['SECRET_KEY'] = 'flask'
app.config['SECURITY_PASSWORD_SALT'] = 'namak'
app.config['SQLALCHEMY_TRACK_MODIFACTIONS'] = False
app.config['WTF_CSRF_ENABLED'] = False
app.config['SECURITY_TOKEN_AUTHENTICATION'] = 'Authentication-Token'


db.init_app(app)
excel.init_excel(app)

app.security = Security(app, user_datastore)

with app.app_context():
    import application.routes

celery_app = celery_init_app(app)


@celery_app.on_after_configure.connect
def reminder(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour = 23, minute = 41),
        daily_reminder.s()
    )

@celery_app.on_after_configure.connect
def report(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour = 23, minute = 41),
        montly_report.s()
    )

if __name__  == '__main__':
    app.run(debug=True)