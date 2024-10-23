from application.model import db, Role
from main import app
from application.security import user_datastore
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    user_datastore.find_or_create_role(name='admin', descr=
                                       'User is an admin. Can blacklist users and see app statisitics')
    
    user_datastore.find_or_create_role(name='general_user', descr=
                                       'User is a general_user. Does not have delete or edit functionality'
                                       )
    
    user_datastore.find_or_create_role(name='creator', descr='user is a creator. Can delete and edit songs')                                  
    db.session.commit()

    admin  = Role.query.filter_by(name='admin').first().users
    if admin == []:
        user_datastore.create_user(email_id='admin@gmail.com', password=generate_password_hash('admin'),
                                    user_name='admin1', f_name='Admin', visited= 'Yes', roles=['admin'])
        
    db.session.commit()