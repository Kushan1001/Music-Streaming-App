from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = 'localhost'
SMTP_PORT = 1025
SENDER_EMAIL = 'No_Reply@music_app.com'

def send_mail(to, subject, content_body):
    message = MIMEMultipart()
    message['To'] = to
    message['Subject'] = subject
    message['From'] = SENDER_EMAIL
    message.attach(MIMEText(content_body, 'html'))
    client = SMTP(host = SMTP_HOST, port = SMTP_PORT) 
    client.send_message(msg = message)
    client.quit()



