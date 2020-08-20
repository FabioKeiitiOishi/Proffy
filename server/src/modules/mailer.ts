import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';

import { host, port, user, pass } from '../app/config/mail.json';

const transport = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass }
});

transport.use('compile', hbs({
  viewEngine: {
    extname: '.html', // handlebars extension
    layoutsDir: 'src/resources/mail/auth/', // location of handlebars templates
    defaultLayout: 'forgot_password', // name of main template
    partialsDir: 'src/resources/mail/auth/', // location of your subtemplates aka. header, footer etc
  },
  viewPath: 'src/resources/mail/',
  extName: '.html'
}));

export default transport;