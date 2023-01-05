const express = require('express');
var mod = require('nested-property');
const path = require('path');
const Pool = require('pg').Pool;
const uniqId = require('uniqid');
const Razorpay = require('razorpay');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

// node mailing
let mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sanjeevmajhi036@gmail.com',
    pass: 'upjpcoxdyacutmxf',
  },
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./resources'));

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'admin',
  port: 5432,
});

console.log(
  'Please, wait for Database confirmation message. Start, once you receive'
);

// creating database and tables if not exists
pool.query(
  `SELECT FROM pg_database WHERE datname = 'data_entry_systems'`,
  (error, results) => {
    if (error) {
      throw error;
    } else {
      if (results.rowCount == 0) {
        pool.query(`CREATE DATABASE data_entry_systems`, (err, res) => {
          if (err) {
            throw error;
          } else {
            let dbConnectedPool = new Pool({
              user: 'postgres',
              host: 'localhost',
              database: 'data_entry_systems',
              password: 'admin',
              port: 5432,
            });

            dbConnectedPool.query(
              `CREATE TABLE IF NOT EXISTS employee_table(id SERIAL,name varchar(30), email varchar(50),password varchar(30), company varchar(50) ,status varchar(8), accessible_charts varchar[],created_by varchar);`,
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  console.log('Employee table created');
                }
              }
            );

            dbConnectedPool.query(
              `CREATE TABLE IF NOT EXISTS defect_table(body_number int , mode varchar (8) , category varchar(30), subcategory varchar(30), defect varchar(20), subdefect varchar(20), zone int, defectCount int, date varchar(10), time varchar(8), empID int,username varchar(30));`,
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  console.log('Defect table created');
                }
              }
            );

            dbConnectedPool.query(
              `CREATE TABLE IF NOT EXISTS body_number_table(body_number int , status varchar(10) , date varchar(10), time varchar(8), empID int,username varchar(30));`,
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  console.log('Body number table created');
                }
              }
            );

            dbConnectedPool.query(
              `CREATE TABLE IF NOT EXISTS admin_activity_table(doneByID int , doneByName varchar(30), activity varchar(30), doneToID int, doneToName varchar(30), date varchar(10), time varchar(8));`,
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  console.log('Admin activity log table created');
                }
              }
            );

            dbConnectedPool.query(
              `CREATE TABLE IF NOT EXISTS company_table(id SERIAL, name varchar(50), root_user varchar(30), root_user_password varchar(10), body_number int, used int, remaining int, date varchar(10), time varchar(8));`,
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  console.log('company table created');
                }
              }
            );

            dbConnectedPool.query(
              `CREATE TABLE IF NOT EXISTS approval_pending_table (id int, name varchar(50), email varchar(50), password varchar(30), company varchar(50), status varchar(8), accessible_charts varchar[], creator_id int,created_by varchar);`,
              (err, result) => {
                if (err) {
                  throw err;
                } else {
                  console.log('appoval pending table created');
                }
              }
            );
          }
        });
      } else {
        console.log('Database connection established');
      }
    }
  }
);

const Options = {
  'RH MAIN BODY': {
    'B-PILLAR - RH MB': [
      '812',
      '813',
      '814',
      '815',
      '816',
      '817',
      '818',
      '819',
      '820',
      '821',
    ],
    'A-PILLAR - RH MB': [
      '800',
      '801',
      '802',
      '803',
      '804',
      '805',
      '806',
      '807',
      '808',
      '809',
      '810',
      '811',
    ],
    'COWL - RH MB': ['822', '823', '824', '825', '826'],
    'C-PILLAR - RH MB': ['822', '823', '824', '825', '826'],
    'BACK DOOR OPENING - RH MB': [
      '851',
      '852',
      '853',
      '854',
      '855',
      '856',
      '857',
      '858',
      '859',
      '860',
      '861',
      '862',
      '863',
      '864',
      '865',
    ],
    'FRONT DOOR OPENING - RH MB': [
      '827',
      '828',
      '829',
      '830',
      '831',
      '832',
      '833',
      '834',
      '835',
      '836',
      '837',
      '838',
    ],
    'QUARTER - RH MB': [
      '866',
      '867',
      '868',
      '869',
      '870',
      '871',
      '872',
      '873',
      '874',
      '875',
      '876',
      '877',
      '878',
      '879',
      '880',
      '881',
      '882',
    ],
    'REAR DOOR OPENING - RH MB': [
      '839',
      '840',
      '841',
      '842',
      '843',
      '844',
      '845',
      '846',
      '847',
      '848',
      '849',
      '850',
    ],
    'ROCKER PANEL SIDE - RH MB': ['888', '889', '890', '891', '892', '893'],
    'ROOF SIDE - RH MB': ['883', '884', '885', '886', '887'],
  },

  'LH MAIN BODY': {
    'B-PILLAR - LH MB': [
      '1100',
      '1101',
      '1102',
      '1103',
      '1104',
      '1105',
      '1106',
      '1107',
      '1108',
      '1109',
    ],
    'A-PILLAR - LH MB': [
      '1110',
      '1111',
      '1112',
      '1113',
      '1114',
      '1115',
      '1116',
      '1117',
      '1118',
      '1119',
      '1120',
    ],
    'COWL - LH MB': ['97', '98', '99', '100'], //Img not available
    'C-PILLAR - LH MB': ['1121', '1122', '1123', '1124', '1125'],
    'BACK DOOR OPENING - LH MB': [
      '1126',
      '1127',
      '1128',
      '1129',
      '1130',
      '1131',
      '1132',
      '1133',
      '1134',
      '1135',
      '1136',
      '1137',
      '1138',
      '1139',
      '1140',
    ],
    'FRONT DOOR OPENING - LH MB': [
      '1141',
      '1142',
      '1143',
      '1144',
      '1145',
      '1146',
      '1147',
      '1148',
      '1149',
      '1150',
      '1151',
      '1152',
    ],
    'QUARTER - LH MB': [
      '1153',
      '1154',
      '1155',
      '1156',
      '1157',
      '1158',
      '1159',
      '1160',
      '1161',
      '1162',
      '1163',
      '1164',
      '1165',
      '1166',
      '1167',
      '1168',
      '1169',
    ],
    'REAR DOOR OPENING - LH MB': [
      '1170',
      '1171',
      '1172',
      '1173',
      '1174',
      '1175',
      '1176',
      '1177',
      '1178',
      '1179',
      '1180',
      '1181',
    ],
    'ROCKER PANEL SIDE - LH MB': [
      '1182',
      '1183',
      '1184',
      '1185',
      '1186',
      '1187',
    ],
    'ROOF SIDE - LH MB': ['125', '126', '127', '128'], //Need to create image
  },

  'RH SHELL BODY SUB-LINE': {
    'HOOD SA OUTER - RH SBSA': [
      '200',
      '201',
      '202',
      '203',
      '204',
      '205',
      '206',
      '207',
      '208',
      '209',
      '210',
      '211',
      '212',
      '213',
      '214',
    ],
    'HOOD SA INNER - RH SBSA': [
      '215',
      '216',
      '217',
      '218',
      '219',
      '220',
      '221',
      '222',
      '223',
      '224',
      '225',
      '226',
    ],
    'FRONT DOOR OUTER - RH SBSA': [
      '227',
      '228',
      '229',
      '230',
      '231',
      '232',
      '233',
      '234',
      '235',
      '236',
      '237',
      '238',
      '239',
      '240',
      '241',
      '242',
      '243',
    ],
    'FRONT DOOR INNER - RH SBSA': [
      '244',
      '245',
      '246',
      '247',
      '248',
      '249',
      '250',
      '251',
      '252',
      '253',
      '254',
      '255',
      '256',
      '257',
      '258',
    ],
    'REAR DOOR OUTER - RH SBSA': [
      '259',
      '260',
      '261',
      '262',
      '263',
      '264',
      '265',
      '266',
      '267',
      '268',
      '269',
      '270',
      '271',
      '272',
      '273',
      '274',
    ],
    'REAR DOOR INNER - RH SBSA': [
      '275',
      '276',
      '277',
      '278',
      '279',
      '280',
      '281',
      '282',
      '283',
      '284',
      '285',
      '286',
      '287',
      '288',
    ],
  },

  'LH SHELL BODY SUB-LINE': {
    'FRONT DOOR OUTER - LH SBSA': [
      '300',
      '301',
      '302',
      '303',
      '304',
      '305',
      '306',
      '307',
      '308',
      '309',
      '310',
      '311',
      '312',
      '313',
      '314',
      '315',
      '316',
    ],
    'FRONT DOOR INNER - LH SBSA': [
      '317',
      '318',
      '319',
      '320',
      '321',
      '322',
      '323',
      '324',
      '325',
      '326',
      '327',
      '328',
      '329',
      '330',
      '331',
    ],
    'BACK DOOR OUTER - LH SBSA': [
      '332',
      '333',
      '334',
      '335',
      '336',
      '337',
      '338',
      '339',
      '340',
      '341',
      '342',
      '343',
      '344',
      '345',
      '346',
      '347',
    ],
    'BACK DOOR INNER - LH SBSA': [
      '348',
      '349',
      '350',
      '351',
      '352',
      '353',
      '354',
      '355',
      '356',
      '357',
      '358',
      '359',
      '360',
      '361',
      '362',
      '363',
      '364',
    ],
    'REAR DOOR OUTER - LH SBSA': [
      '365',
      '366',
      '367',
      '368',
      '369',
      '370',
      '371',
      '372',
      '373',
      '374',
      '375',
      '376',
      '377',
      '378',
      '379',
      '380',
    ],
    'REAR DOOR INNER - LH SBSA': [
      '381',
      '382',
      '383',
      '384',
      '385',
      '386',
      '387',
      '388',
      '389',
      '390',
      '391',
      '392',
      '393',
      '394',
    ],
  },
  'RH SHELL BODY MAIN-LINE': {
    'FENDER - RH SBML': ['600', '601', '602', '603', '604', '605', '606'],
    'HOOD SA OUTER SBML': [
      '671',
      '672',
      '673',
      '674',
      '675',
      '676',
      '677',
      '678',
      '679',
      '680',
      '681',
      '682',
      '683',
      '684',
      '685',
    ],
    'HOOD SA INNER SBML': [
      '686',
      '687',
      '688',
      '689',
      '690',
      '691',
      '692',
      '693',
      '694',
      '695',
      '696',
      '697',
    ],
    'FRONT DOOR OUTER - RH SBML': [
      '607',
      '608',
      '609',
      '610',
      '611',
      '612',
      '613',
      '614',
      '615',
      '616',
      '617',
      '618',
      '619',
      '620',
      '621',
      '622',
      '623',
    ],
    'FRONT DOOR INNER - RH SBML': [
      '624',
      '625',
      '626',
      '627',
      '628',
      '629',
      '630',
      '631',
      '632',
      '633',
      '634',
      '635',
      '636',
      '637',
      '638',
    ],
    'REAR DOOR OUTER - RH SBML': [
      '639',
      '640',
      '641',
      '642',
      '643',
      '644',
      '645',
      '646',
      '647',
      '648',
      '649',
      '650',
      '651',
      '652',
      '653',
      '654',
    ],
    'REAR DOOR INNER - RH SBML': [
      '655',
      '656',
      '657',
      '658',
      '659',
      '660',
      '661',
      '662',
      '663',
      '664',
      '665',
      '666',
      '667',
      '668',
    ],
  },

  'LH SHELL BODY MAIN-LINE': {
    'FENDER - LH SBML': ['500', '501', '502', '503', '504', '505', '506'],
    'FRONT DOOR OUTER - LH SBML': [
      '507',
      '508',
      '509',
      '510',
      '511',
      '512',
      '513',
      '514',
      '515',
      '516',
      '517',
      '518',
      '519',
      '520',
      '521',
      '522',
      '523',
    ],
    'FRONT DOOR INNER - LH SBML': [
      '524',
      '525',
      '526',
      '527',
      '528',
      '529',
      '530',
      '531',
      '532',
      '533',
      '534',
      '535',
      '536',
      '537',
      '538',
    ],
    'REAR DOOR OUTER - LH SBML': [
      '539',
      '540',
      '541',
      '542',
      '543',
      '544',
      '545',
      '546',
      '547',
      '548',
      '549',
      '550',
      '551',
      '552',
      '553',
      '554',
    ],
    'REAR DOOR INNER - LH SBML': [
      '555',
      '556',
      '557',
      '558',
      '559',
      '560',
      '561',
      '562',
      '563',
      '564',
      '565',
      '566',
      '567',
      '568',
    ],
    'BACK DOOR OUTER - LH SBML': [
      '569',
      '570',
      '571',
      '572',
      '573',
      '574',
      '575',
      '576',
      '577',
      '578',
      '579',
      '580',
      '581',
      '582',
      '583',
      '584',
    ],
    'BACK DOOR INNER - LH SBML': [
      '585',
      '586',
      '587',
      '588',
      '589',
      '590',
      '591',
      '592',
      '593',
      '594',
      '595',
      '596',
      '597',
      '598',
      '599',
      '600',
      '601',
    ],
  },

  'RH SIDE MEMBER': {
    'A-PILLAR - RH SM': [
      '800',
      '801',
      '802',
      '803',
      '804',
      '805',
      '806',
      '807',
      '808',
      '809',
      '810',
      '811',
    ],
    'C-PILLAR - RH SM': ['822', '823', '824', '825', '826'],
    'B-PILLAR - RH SM': [
      '812',
      '813',
      '814',
      '815',
      '816',
      '817',
      '818',
      '819',
      '820',
      '821',
    ],
    'BACK DOOR OPENING - RH SM': [
      '851',
      '852',
      '853',
      '854',
      '855',
      '856',
      '857',
      '858',
      '859',
      '860',
      '861',
      '862',
      '863',
      '864',
      '865',
    ],
    'FRONT DOOR OPENING - RH SM': [
      '827',
      '828',
      '829',
      '830',
      '831',
      '832',
      '833',
      '834',
      '835',
      '836',
      '837',
      '838',
    ],
    'QUARTER - RH SM': [
      '866',
      '867',
      '868',
      '869',
      '870',
      '871',
      '872',
      '873',
      '874',
      '875',
      '876',
      '877',
      '878',
      '879',
      '880',
      '881',
      '882',
    ],
    'REAR DOOR OPENING - RH SM': [
      '839',
      '840',
      '841',
      '842',
      '843',
      '844',
      '845',
      '846',
      '847',
      '848',
      '849',
      '850',
    ],
    'ROCKER PANEL SIDE - RH SM': ['888', '889', '890', '891', '892', '893'],
    'ROOF SIDE - RH SM': ['883', '884', '885', '886', '887'],
  },

  'LH SIDE MEMBER': {
    'A-PILLAR - LH SM': [
      '700',
      '701',
      '702',
      '703',
      '704',
      '705',
      '706',
      '707',
      '708',
      '709',
      '710',
    ],
    'C-PILLAR - LH SM': ['722', '723', '724', '725', '726'],
    'B-PILLAR - LH SM': [
      '712',
      '713',
      '714',
      '715',
      '716',
      '717',
      '718',
      '719',
      '720',
      '721',
    ],
    'BACK DOOR OPENING - LH SM': [
      '751',
      '752',
      '753',
      '754',
      '755',
      '756',
      '757',
      '758',
      '759',
      '760',
      '761',
      '762',
      '763',
      '764',
      '765',
    ],
    'FRONT DOOR OPENING - LH SM': [
      '727',
      '728',
      '729',
      '730',
      '731',
      '732',
      '733',
      '734',
      '735',
      '736',
      '737',
      '738',
    ],
    'QUARTER - LH SM': [
      '766',
      '767',
      '768',
      '769',
      '770',
      '771',
      '772',
      '773',
      '774',
      '775',
      '776',
      '777',
      '778',
      '779',
      '780',
      '781',
      '782',
    ],
    'REAR DOOR OPENING - LH SM': [
      '739',
      '740',
      '741',
      '742',
      '743',
      '744',
      '745',
      '746',
      '747',
      '748',
      '749',
      '750',
    ],
    'ROCKER PANEL SIDE - LH SM': ['791', '792', '793', '794', '795', '796'],
    'ROOF SIDE - LH SM': [
      '783',
      '784',
      '785',
      '786',
      '787',
      '788',
      '789',
      '790',
    ],
  },
  'UNDER BODY': {
    'RH APRON': ['1', '2', '3', '4'],
    'LH APRON': ['5', '6', '7', '8'],
    'FRONT FLOOR TOP SIDE': ['9', '10', '11', '12'],
    'FRONT FLOOR BOTTOM SIDE': ['13', '14', '15', '16'],
    'CENTER FLOOR TOP SIDE': ['17', '18', '19', '20'],
    'CENTER FLOOR BOTTOM SIDE': ['21', '22', '23', '24'],
    'REAR FLOOR TOP SIDE': ['25', '26', '27', '28'],
    'REAR FLOOR BOTTOM SIDE': ['29', '30', '31', '32'],
    'DASH OUTER': ['33', '34', '35', '36'],
    'DASH INNER': ['37', '38', '39', '40'],
    'RADIATOR SUPPORT': ['41', '42', '43', '44'],
    'LOWER BACK': ['45', '46', '47', '48'],
  },
};

// let username = ' ';
// let emp_ID = ' ';

// let enteredBodyNumber = 0;
// let selectedSubCategory = '';
// let defectBodyNumberStatus = '';

app.get('/', (req, res) => {
  try {
    console.log('home ');
    res.render(path.join(__dirname, '/views/home.ejs'));
  } catch (err) {
    console.log(err);
  }
});

app.get('/checkout', (req, res) => {
  try {
    res.render(path.join(__dirname, '/views/checkout.ejs'));
  } catch (error) {
    console.log(error);
  }
});

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    if (username == 'Administrator' && password == 'admin@123') {
      const token = jwt.sign(
        { id: 'Administrator' },
        process.env.TOKEN_SECRET,
        {
          expiresIn: '1d',
        }
      );
      res.send(
        JSON.stringify({
          userStatus: 'Administrator',
          validation: 'success',
          token: token,
        })
      );
    } else {
      const employeeResponse = await dbConnectedPool.query(
        `SELECT * FROM employee_table WHERE name='${username}' AND password='${password}'`
      );
      if (employeeResponse.rows.length > 0) {
        const token = jwt.sign(
          { id: employeeResponse.rows[0].id },
          process.env.TOKEN_SECRET,
          {
            expiresIn: '1d',
          }
        );
        res.send(
          JSON.stringify({
            userStatus: 'Employee',
            validation: 'success',
            username: req.body.username,
            emp_ID: employeeResponse.rows[0].id,
            companyName: employeeResponse.rows[0].company,
            token: token,
          })
        );
      } else {
        res.send(
          JSON.stringify({
            userStatus: 'Employee',
            validation: 'failure',
          })
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
});

function authenticateToken(req, res, next) {
  const token = req.body.token;

  console.log('token: ', req.body);

  if (token == '' || token == null) {
    console.log('un authenticated');
    res.redirect('/');
  } else {
    console.log('authenticated');
    next();
  }
}

app.get('/forgotPassword', (req, res) => {
  try {
    res.render(path.join(__dirname, '/views/forgetPassword.ejs'));
  } catch (err) {
    console.log(err);
  }
});

app.post('/emailVerification', async (req, res) => {
  try {
    const enteredEmail = req.body.email;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const response = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE email='${enteredEmail}'`
    );

    if (response.rows.length > 0) {
      // send otp to mail

      var digits = '0123456789';
      let OTP = '';

      for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }

      let mailDetails = {
        from: 'sanjeevmajhi036@gmail.com',
        to: `${enteredEmail}`,
        subject: 'Reset Password from Data Entry Application',
        text: `Hi, OTP to reset your password: ${OTP}`,
      };

      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log('Error Occurs');
          console.log(err);
          res.send(
            JSON.stringify({
              status: 'failure',
              message: 'error sending OTP',
            })
          );
        } else {
          console.log('Reset Password: OTP sent successfully');
          res.send(
            JSON.stringify({
              status: 'success',
              otp: OTP,
            })
          );
        }
      });
    } else {
      res.send(
        JSON.stringify({
          status: 'failure',
        })
      );
    }
  } catch (err) {
    console.log(err);
  }
});

app.post('/resetPassword', async (req, res) => {
  try {
    console.log('resetPassword');
    const email = req.body.email;
    const newPassword = req.body.password;

    console.log('email: ', email);
    console.log('newPassword: ', newPassword);

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const response = await dbConnectedPool.query(
      `UPDATE employee_table SET password='${newPassword}' WHERE email='${email}'`
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post('/adminPortal', authenticateToken, async (req, res) => {
  try {
    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const companyResponse = await dbConnectedPool.query(
      `SELECT * FROM company_table`
    );

    let companyDetail = [];
    companyResponse.rows.map((company) => {
      companyDetail.push({
        id: company.id,
        name: company.name,
        root_user: company.root_user,
        body_number: company.body_number,
        used: company.used,
        remaining: company.remaining,
        date: company.date,
        time: company.time,
      });
    });
    res.render(path.join(__dirname, '/views/adminPortal.ejs'), {
      companyDetail,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/createCompany', async (req, res) => {
  try {
    // name(50), root user(30), root_user_password(10),
    const companyName = req.body.companyName;
    const rootUserName = req.body.rootUserName;
    const rootUserEmail = req.body.rootUserEmail;
    const rootUserPassword = req.body.rootUserPassword;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    // insert into company_table
    await dbConnectedPool.query(
      `INSERT INTO company_table (name,root_user,root_user_password,body_number,used,remaining,date,time) VALUES ('${companyName}','${rootUserName}','${rootUserPassword}',100,0,100,'${date}','${time}')`
    );

    // insert into employee_table
    await dbConnectedPool.query(
      `INSERT INTO employee_table (name,email,password,company,status,accessible_charts,created_by) VALUES ('${rootUserName}','${rootUserEmail}','${rootUserPassword}','${companyName}','admin',Array['DPV (Defects Per Vehicle) Report','Master Report','Main Pareto Report','Pareto Report','Surface Summary','Body Fitting Summary','Missing & Wrong Part Summary','Welding Summary','Water Leak Summary','Color Map'],'Root User')`
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post('/addUser', authenticateToken, (req, res) => {
  try {
    const firstUser = req.body.firstUser;

    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const currentCompany = req.body.empCompany;
    const companyName = req.body.companyName;

    res.render(path.join(__dirname, '/views/createNewUser.ejs'), {
      currentUser,
      currentEmpID,
      currentCompany,
      companyName,
      firstUser,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/removeUser', async (req, res) => {
  try {
    const userID = req.body.userID;
    const userName = req.body.userName;
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    const response = await dbConnectedPool.query(
      `DELETE FROM employee_table WHERE id = ${userID}`
    );

    await dbConnectedPool.query(
      `INSERT INTO admin_activity_table (doneByID,doneByName,activity,doneToID,doneToName,date,time) VALUES (${currentEmpID},'${currentUser}','removed',${userID},'${userName}','${date}','${time}')`
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post('/newUser', async (req, res) => {
  try {
    const empName = req.body.empName;
    const empEmail = req.body.empEmail;
    const empPassword = req.body.empPassword;
    const empStatus = req.body.empStatus;
    const empCompany = req.body.currentCompany;
    const accessibleCharts = req.body.accessibleCharts;
    const creator = req.body.creator;
    const creatorID = req.body.creatorID;
    const empID = req.body.dummyEmpID;

    console.log('New User Created: ', empName);
    console.log('status: ', empStatus);

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    const dummyEmpIDResponse = await dbConnectedPool.query(
      `SELECT * FROM approval_pending_table WHERE id=${empID}`
    );

    const emailChecker = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE email='${empEmail}' AND company='${empCompany}'`
    );

    if (dummyEmpIDResponse.rows.length == 0) {
      if (emailChecker.rows.length == 0) {
        let mailDetails = {
          from: 'sanjeevmajhi036@gmail.com',
          to: empEmail,
          subject: 'Invitation to create new user',
          text: `Check this link and fill the form \n http://13.231.146.190:2000/verifyUser \n Credentials \n ID: ${empID} \n Password: ${empPassword}`,
        };

        mailTransporter.sendMail(mailDetails, async function (err, data) {
          if (err) {
            console.log('Error occured while sending email');
            console.log(err);
            res.send(
              JSON.stringify({
                status: 'failure',
                reason: 'error in sending mail',
              })
            );
          } else {
            console.log('Email sent successfully');
            // name,email,password,company,status,accessible_charts,created_by
            // id int, name varchar(50), email varchar(50), password varchar(30), company varchar(50), status varchar(8), accessible_charts varchar[], created_by varchar

            // invitation sent and stored in database

            await dbConnectedPool.query(
              `INSERT INTO approval_pending_table(id,name,email,password,company,status,accessible_charts,creator_id,created_by) VALUES (${empID},'${empName}','${empEmail}','${empPassword}','${empCompany}','${empStatus}',ARRAY['${accessibleCharts.join(
                `','`
              )}'],${creatorID},'${creator}')`
            );
            res.send(
              JSON.stringify({
                status: 'success',
              })
            );
          }
        });
      } else {
        res.send(
          JSON.stringify({
            status: 'failure',
            reason: 'existing email address',
          })
        );
      }
    } else {
      res.send(
        JSON.stringify({
          status: 'failure',
          reason: 'dummy ID already existing',
        })
      );
    }
  } catch (err) {
    console.log(err);
    res.send(
      JSON.stringify({
        status: 'failure',
        reason: 'backend error',
      })
    );
  }
});

app.get('/verifyUser', (req, res) => {
  try {
    res.render(path.join(__dirname, '/views/verifyUser.ejs'));
  } catch (err) {
    console.log(err);
  }
});

app.post('/approveUser', async (req, res) => {
  try {
    const userID = req.body.userID;
    const password = req.body.password;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let currentDate = new Date();

    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    const CheckUserResponse = await dbConnectedPool.query(
      `SELECT * FROM approval_pending_table WHERE id=${userID}`
    );

    if (
      CheckUserResponse.rows.length != 0 &&
      password == CheckUserResponse.rows[0].password
    ) {
      const userReponse = await dbConnectedPool.query(
        `INSERT INTO employee_table (name,email,password,company,status,accessible_charts,created_by) VALUES ('${
          CheckUserResponse.rows[0].name
        }','${CheckUserResponse.rows[0].email}','${
          CheckUserResponse.rows[0].password
        }','${CheckUserResponse.rows[0].company}','${
          CheckUserResponse.rows[0].status
        }',ARRAY['${CheckUserResponse.rows[0].accessible_charts.join(
          `','`
        )}'],'${CheckUserResponse.rows[0].created_by}') RETURNING id`
      );

      await dbConnectedPool.query(
        `INSERT INTO admin_activity_table (doneByID,doneByName,activity,doneToID,doneToName,date,time) VALUES (${CheckUserResponse.rows[0].creator_id},'${CheckUserResponse.rows[0].created_by}','created',${userReponse.rows[0].id},'${CheckUserResponse.rows[0].name}','${date}','${time}')`
      );

      await dbConnectedPool.query(
        `DELETE FROM approval_pending_table WHERE id=${userID}`
      );
      res.send(
        JSON.stringify({
          status: 'success',
          reason: 'activated',
        })
      );
    } else {
      res.send(
        JSON.stringify({
          status: 'failure',
          reason: 'invalid credentials',
        })
      );
    }

    // check the password with approvalPending table for userid and password
    // if same-- save it in database
    // else send response as invalid credentials
  } catch (err) {
    console.log(err);
    res.send(
      JSON.stringify({
        status: 'failure',
        reason: 'backend error',
      })
    );
  }
});

app.post('/follower', authenticateToken, async (req, res) => {
  try {
    console.log('follower');

    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;

    console.log('currentUser: ', currentUser);
    console.log('currentEmpID: ', currentEmpID);
    console.log('companyName: ', companyName);

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const response = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE id=${currentEmpID};`
    );

    const emp_Status = response.rows[0].status;
    const emp_ChartAccess = response.rows[0].accessible_charts;

    res.render(path.join(__dirname, '/views/follower.ejs'), {
      currentUser,
      currentEmpID,
      emp_Status,
      emp_ChartAccess,
      companyName,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/bodyNumberBalanceChecker', async (req, res) => {
  try {
    const currentBodyNumber = req.body.currentBodyNumber;
    const companyName = req.body.companyName;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const bodyNumberResponse = await dbConnectedPool.query(
      `SELECT * FROM defect_table WHERE body_number=${currentBodyNumber}`
    );

    const companyResponse = await dbConnectedPool.query(
      `SELECT * FROM company_table WHERE name='${companyName}'`
    );

    if (companyResponse.rows[0].remaining == 0) {
      if (bodyNumberResponse.rows.length == 0) {
        res.send(
          JSON.stringify({
            status: 'failure',
            balance: 'zero',
          })
        );
      } else {
        res.send(
          JSON.stringify({
            status: 'success',
            balance: 'oldBodyNumber',
          })
        );
      }
    } else {
      res.send(
        JSON.stringify({
          status: 'success',
          balance: 'non_zero',
        })
      );
    }
  } catch (err) {
    console.log(err);
  }
});

app.post('/bodyNumber', (req, res) => {
  try {
    const currentBodyNumber = req.body.currentBodyNumber;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    // console.log(
    //   `SELECT * FROM body_number_table WHERE body_number=${currentBodyNumber};`
    // );

    let currentDate = new Date();

    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    dbConnectedPool.query(
      `SELECT * FROM body_number_table WHERE body_number=${currentBodyNumber} and date ='${date}';`,
      (error, result) => {
        if (error) {
          console.log(error);
        } else {
          if (result.rows.length == 0) {
            let response = {
              status: 'success',
              data: [],
            };

            // console.log(JSON.stringify(response));

            res.send(JSON.stringify(response));
          } else {
            let response = {
              status: 'success',
              data: result.rows,
            };

            // console.log(JSON.stringify(response));

            res.end(JSON.stringify(response));
          }
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
});

app.post('/passcar', (req, res) => {
  try {
    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    console.log('currentUser: ', currentUser);

    if (req.body.bodyNumberStatus == 'newBodyNumber') {
      console.log(
        `INSERT INTO body_number_table (body_number,status,date,time,empID,username) VALUES (${req.body.bodyNumber},'No Defect','${date}','${time}',${currentEmpID},'${currentUser}')`
      );
      dbConnectedPool.query(
        `INSERT INTO body_number_table (body_number,status,date,time,empID,username) VALUES (${req.body.bodyNumber},'No Defect','${date}','${time}',${currentEmpID},'${currentUser}')`,
        (error, result) => {
          if (error) {
            throw error;
          } else {
            // console.log('New Body Number', result);
          }
        }
      );
    }

    let response = {
      status: 'success',
    };

    res.end(JSON.stringify(response));
  } catch (err) {
    console.log(err);
  }
});

app.post('/firstlayer', authenticateToken, (req, res) => {
  try {
    console.log('first layer');
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;
    const currentBodyNumber = req.body.currentBodyNumber;
    const defectBodyNumberStatus = req.body.bodyNumberStatus;

    // console.log('currentUser: ', currentUser);
    // console.log('currentEmpID: ', currentEmpID);
    // console.log('currentBodyNumber: ', currentBodyNumber);
    // console.log('defectBodyNumberStatus: ', defectBodyNumberStatus);

    const bodyNumberOptions = Object.keys(Options);
    res.render(path.join(__dirname, '/views/firstLayer.ejs'), {
      currentUser,
      currentEmpID,
      companyName,
      currentBodyNumber,
      bodyNumberOptions,
      defectBodyNumberStatus,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/addCategory', async (req, res) => {
  try {
    const addingCategory = req.body.newCategory;

    Options[addingCategory] = {};

    res.send(
      JSON.stringify({
        status: 'success',
      })
    );
  } catch (err) {
    console.log(err);
    res.send(
      JSON.stringify({
        status: 'failure',
        reason: 'backend error',
      })
    );
  }
});

app.post('/removeCategory', async (req, res) => {
  try {
    const removingCategory = req.body.category;

    delete Options[removingCategory];

    res.sendStatus(200);
  } catch (err) {
    console.log(err);

    res.sendStatus(400);
  }
});

app.post('/updateCategory', (req, res) => {
  try {
    const updateCategory = req.body.updateCategory;
    const newCategoryName = req.body.newCategoryName;

    let temp;
    temp = Options[updateCategory];
    Options[newCategoryName] = temp;
    delete Options[updateCategory];

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post('/addSubCategory', async (req, res) => {
  try {
    const addingSubCategory = req.body.addingSubCategory;
    const addingCategory = req.body.addingCategory;

    Options[addingCategory][addingSubCategory] = {};

    res.send(
      JSON.stringify({
        status: 'success',
      })
    );
  } catch (err) {
    console.log(err);
    res.send(
      JSON.stringify({
        status: 'failure',
        reason: 'backend error',
      })
    );
  }
});

app.post('/removeSubCategory', (req, res) => {
  try {
    const removeSubCategory = req.body.removeSubCategory;
    const Category = req.body.Category;

    delete Options[Category][removeSubCategory];

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post('/updateSubCategory', (req, res) => {
  try {
    const updateSubCategory = req.body.updateSubCategory;
    const newSubCategoryName = req.body.newSubCategoryName;

    let temp;
    temp = Options[updateSubCategory];
    Options[newSubCategoryName] = temp;
    delete Options[updateSubCategory];

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post('/secondlayer', authenticateToken, (req, res) => {
  try {
    console.log('second layer');

    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;
    const currentBodyNumber = req.body.currentBodyNumber;
    const defectBodyNumberStatus = req.body.defectBodyNumberStatus;
    const selectedCategory = req.body.selectedCategory;
    const mode = req.body.mode;

    // console.log('currentUser: ', currentUser);
    // console.log('currentEmpID: ', currentEmpID);
    // console.log('currentBodyNumber: ', currentBodyNumber);
    // console.log('defectBodyNumberStatus: ', defectBodyNumberStatus);
    // console.log('selectedCategory: ', selectedCategory);
    // console.log('mode: ', mode);

    const categoryOptions = Options[selectedCategory];
    let ShortlistedCategoryOptions = Object.keys(categoryOptions);
    res.render(path.join(__dirname, '/views/secondLayer.ejs'), {
      currentUser,
      currentEmpID,
      companyName,
      currentBodyNumber,
      defectBodyNumberStatus,
      selectedCategory,
      ShortlistedCategoryOptions,
      mode,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/thirdlayer', authenticateToken, (req, res) => {
  try {
    console.log('third layer');

    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;
    const currentBodyNumber = req.body.currentBodyNumber;
    const defectBodyNumberStatus = req.body.defectBodyNumberStatus;
    const selectedCategory = req.body.selectedCategory;
    const selectedSubCategory = req.body.selectedSubCategory;
    const mode = req.body.mode;

    // console.log('currentUser: ', currentUser);
    // console.log('currentEmpID: ', currentEmpID);
    // console.log('currentBodyNumber: ', currentBodyNumber);
    // console.log('defectBodyNumberStatus: ', defectBodyNumberStatus);
    // console.log('selectedCategory: ', selectedCategory);
    // console.log('selectedSubCategory: ', selectedSubCategory);
    // console.log('mode: ', mode);

    var SubCategoryOptions = Options[selectedCategory];
    SubCategoryOptions = SubCategoryOptions[selectedSubCategory];

    const ShortlistedSubCategoryOptions = SubCategoryOptions;
    const defectObject = {
      surface: {
        name: 'Surface',
        subdefects: {
          dent: 'Dent',
          bump: 'Bump',
          burrs: 'Burrs',
          spatters: 'Spatters',
          others: 'Others',
        },
      },
      bodyFitting: {
        name: 'Body Fitting',
        subdefects: {
          'body-fitting-1': 'Body Fitting 1',
          'body-fitting-2': 'Body Fitting 2',
          'body-fitting-others': 'Body Fitting Others',
        },
      },
      missingWrongPart: {
        name: 'Missing & Wrong Part',
        subdefects: {
          'missing-part': 'Missing Part',
          'wrong-part': 'Wrong Part',
        },
      },
      welding: {
        name: 'Welding',
        subdefects: {
          'welding-part-1': 'Welding Part 1',
          'welding-part-2': 'Welding Part 2',
          'welding-part-3': 'Welding Part 3',
          'welding-part-others': 'Welding Part Others',
        },
      },
      waterLeak: {
        name: 'Water Leak',
        subdefects: {
          'water-leak-1': 'Water Leak 1',
          'water-leak-2': 'Water Leak 2',
          'water-leak-others': 'Water Leak Others',
        },
      },
    };

    let categoryId = selectedCategory.replace(/ /g, '_');
    let subcategoryId = selectedSubCategory.replace(/ /g, '');

    console.log(`${categoryId}_${subcategoryId}`);

    res.render(path.join(__dirname, '/views/thirdLayer.ejs'), {
      currentUser,
      currentEmpID,
      companyName,
      currentBodyNumber,
      defectBodyNumberStatus,
      selectedCategory,
      selectedSubCategory,
      defectObject,
      ShortlistedSubCategoryOptions,
      categoryId,
      subcategoryId,
      mode,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/zonechecker', async (req, res) => {
  try {
    console.log('zone checker');

    const defectObj = req.body.defectObj;
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;
    const currentBodyNumber = req.body.currentBodyNumber;
    const defectBodyNumberStatus = req.body.defectBodyNumberStatus;
    const selectedCategory = req.body.selectedCategory;
    const selectedSubCategory = req.body.selectedSubCategory;
    const mode = req.body.mode;

    // console.log('currentUser: ', currentUser);
    // console.log('currentEmpID: ', currentEmpID);
    // console.log('currentBodyNumber: ', currentBodyNumber);
    // console.log('defectBodyNumberStatus: ', defectBodyNumberStatus);
    // console.log('selectedCategory: ', selectedCategory);
    // console.log('selectedSubCategory: ', selectedSubCategory);
    // console.log('mode: ', mode);

    let filledDefects = {};
    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    Object.keys(defectObj).map((defect) => {
      let defectArray = defect.split('_');
      defectArray[2] = `_${defectArray[2]}`;
      mod.set(filledDefects, defectArray.join('.'), defectObj[defect]);
    });

    console.log('filledDefects:', filledDefects);

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let messageObject = {};

    async function storeManager() {
      // storing the defects or modifying
      await Promise.all(
        Object.keys(filledDefects).map(async (defectName) => {
          await Promise.all(
            Object.keys(filledDefects[defectName]).map(
              async (subDefectName) => {
                await Promise.all(
                  Object.keys(filledDefects[defectName][subDefectName]).map(
                    async (zone) => {
                      const result = await dbConnectedPool.query(
                        `SELECT * FROM defect_table WHERE body_number=${currentBodyNumber} AND mode='${mode}' AND category='${selectedCategory}' AND subcategory='${selectedSubCategory}' AND defect='${defectName}' AND subdefect='${subDefectName}' AND zone = ${zone.replace(
                          '_',
                          ''
                        )}`
                      );
                      if (result.rows.length == 0) {
                        mod.set(
                          messageObject,
                          `New Zone.${zone}.${defectName}.${subDefectName}`,
                          filledDefects[defectName][subDefectName][zone]
                        );
                      } else {
                        // block to modify existing defect records
                        mod.set(
                          messageObject,
                          `Existing Zone.${zone}.${defectName}.${subDefectName}`,
                          filledDefects[defectName][subDefectName][zone]
                        );
                      }
                    }
                  )
                );
              }
            )
          );
        })
      );
    }

    storeManager().then(() => {
      res.send(
        JSON.stringify({
          status: 'success',
          data: messageObject,
        })
      );
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/receive-thirdLayer-temp', async (req, res) => {
  try {
    console.log('receive third layer');
    const defectObj = req.body.defectObj;
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;
    const currentBodyNumber = req.body.currentBodyNumber;
    let defectBodyNumberStatus = req.body.defectBodyNumberStatus;
    const selectedCategory = req.body.selectedCategory;
    const selectedSubCategory = req.body.selectedSubCategory;
    const mode = req.body.mode;

    // console.log('currentUser: ', currentUser);
    // console.log('currentEmpID: ', currentEmpID);
    // console.log('currentBodyNumber: ', currentBodyNumber);
    // console.log('defectBodyNumberStatus: ', defectBodyNumberStatus);
    // console.log('selectedCategory: ', selectedCategory);
    // console.log('selectedSubCategory: ', selectedSubCategory);
    // console.log('mode: ', mode);

    let filledDefects = {};
    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    Object.keys(defectObj).map((defect) => {
      let defectArray = defect.split('_');
      defectArray[2] = `_${defectArray[2]}`;
      mod.set(filledDefects, defectArray.join('.'), defectObj[defect]);
    });

    console.log('filledDefects:', filledDefects);

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const bodyNumberResponse = await dbConnectedPool.query(
      `SELECT * FROM defect_table WHERE body_number=${currentBodyNumber}`
    );

    if (bodyNumberResponse.rows.length == 0) {
      const companyResponse = await dbConnectedPool.query(
        `SELECT * FROM company_table WHERE name='${companyName}'`
      );

      await dbConnectedPool.query(
        `UPDATE company_table SET used=${
          companyResponse.rows[0].used + 1
        } , remaining = ${
          companyResponse.rows[0].remaining - 1
        } WHERE name = '${companyName}'`
      );
    }

    let messageObject = {};

    async function storeManager() {
      // storing the defects or modifying
      await Promise.all(
        Object.keys(filledDefects).map(async (defectName) => {
          await Promise.all(
            Object.keys(filledDefects[defectName]).map(
              async (subDefectName) => {
                await Promise.all(
                  Object.keys(filledDefects[defectName][subDefectName]).map(
                    async (zone) => {
                      const result = await dbConnectedPool.query(
                        `SELECT * FROM defect_table WHERE body_number=${currentBodyNumber} AND mode='${mode}' AND category='${selectedCategory}' AND subcategory='${selectedSubCategory}' AND defect='${defectName}' AND subdefect='${subDefectName}' AND zone = ${zone.replace(
                          '_',
                          ''
                        )}`
                      );
                      if (result.rows.length == 0) {
                        mod.set(
                          messageObject,
                          `Newly Saved Zone.${zone}.${defectName}.${subDefectName}`,
                          filledDefects[defectName][subDefectName][zone]
                        );
                        // block to save defects record for the first time
                        console.log(
                          `INSERT INTO defect_table (body_number,mode,category,subcategory,defect,subdefect,zone,defectCount,date,time,empID,username) VALUES (${currentBodyNumber},'${mode}','${selectedCategory}','${selectedSubCategory}','${defectName}','${subDefectName}',${zone.replace(
                            '_',
                            ''
                          )},${
                            filledDefects[defectName][subDefectName][zone]
                          },'${date}','${time}',${currentEmpID},'${currentUser}');`
                        );
                        await dbConnectedPool.query(
                          `INSERT INTO defect_table (body_number,mode,category,subcategory,defect,subdefect,zone,defectCount,date,time,empID,username) VALUES (${currentBodyNumber},'${mode}','${selectedCategory}','${selectedSubCategory}','${defectName}','${subDefectName}',${zone.replace(
                            '_',
                            ''
                          )},${
                            filledDefects[defectName][subDefectName][zone]
                          },'${date}','${time}',${currentEmpID},'${currentUser}');`
                        );
                      } else {
                        // block to modify existing defect records
                        mod.set(
                          messageObject,
                          `Overwritten Zone.${zone}.${defectName}.${subDefectName}`,
                          filledDefects[defectName][subDefectName][zone]
                        );

                        console.log(
                          `UPDATE defect_table SET defectCount=${
                            filledDefects[defectName][subDefectName][zone]
                          },date='${date}',time='${time}',username='${currentUser}' WHERE body_number=${currentBodyNumber} AND mode='${mode}' AND category='${selectedCategory}' AND subcategory='${selectedSubCategory}' AND defect='${defectName}' AND subdefect='${subDefectName}' AND zone=${zone.replace(
                            '_',
                            ''
                          )}`
                        );

                        await dbConnectedPool.query(
                          `UPDATE defect_table SET defectCount=${
                            filledDefects[defectName][subDefectName][zone]
                          },date='${date}',time='${time}',empID = ${currentEmpID},username='${currentUser}' WHERE body_number=${currentBodyNumber} AND mode='${mode}' AND category='${selectedCategory}' AND subcategory='${selectedSubCategory}' AND defect='${defectName}' AND subdefect='${subDefectName}' AND zone=${zone.replace(
                            '_',
                            ''
                          )}`
                        );
                      }
                    }
                  )
                );
              }
            )
          );
        })
      );

      console.log(defectBodyNumberStatus);

      if (defectBodyNumberStatus == 'newBodyNumber') {
        console.log(
          `INSERT INTO body_number_table (body_number,status,date,time,empID,username) VALUES (${currentBodyNumber},'Defect','${date}','${time}',${currentEmpID},'${currentUser}')`
        );
        dbConnectedPool.query(
          `INSERT INTO body_number_table (body_number,status,date,time,empID,username) VALUES (${currentBodyNumber},'Defect','${date}','${time}',${currentEmpID},'${currentUser}')`,
          (error, result) => {
            if (error) {
              throw error;
            } else {
              // console.log('New Body Number', result);
            }
          }
        );
        defectBodyNumberStatus = 'existingBodyNumber';
      } else if (defectBodyNumberStatus == 'existingBodyNumber') {
        console.log(
          `UPDATE body_number_table SET time='${time}',empID=${currentEmpID},username='${currentUser}' WHERE body_number = '${currentBodyNumber}' and date='${date}';`
        );
        dbConnectedPool.query(
          `UPDATE body_number_table SET time='${time}',empID=${currentEmpID},username='${currentUser}' WHERE body_number = '${currentBodyNumber}' and date='${date}';`,
          (error, result) => {
            if (error) {
              throw error;
            } else {
              // console.log('Body Number Modified', result);
            }
          }
        );
      }
    }

    storeManager().then(() => {
      res.send(
        JSON.stringify({
          status: 'success',
          data: messageObject,
        })
      );
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/filter', async (req, res) => {
  try {
    console.log('filter');
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const response = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE id=${currentEmpID};`
    );

    const accessibleReport = response.rows[0].accessible_charts;
    const emp_Status = response.rows[0].status;

    res.render(path.join(__dirname, '/views/adminLaundingPage.ejs'), {
      currentUser,
      currentEmpID,
      accessibleReport,
      emp_Status,
      companyName,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/reportDataProvider', async (req, res) => {
  try {
    const queryReceiver = req.body.querySender;
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;
    const defectMode = req.body.mode;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let queryResult = {
      UB: [],
      MB: [],
      'SB SA': [],
      'SB ML': [],
      SM: [],
    };

    let bodyNumberData = [];

    for (let [key, value] of Object.entries(queryReceiver)) {
      for (let j = 0; j < value.length; j++) {
        result = await dbConnectedPool.query(value[j]);
        let fetchedRows = result.rows;
        let defectsCount = 0;
        for (let k = 0; k < fetchedRows.length; k++) {
          if (
            Date.parse(fetchedRows[k].date) <= Date.parse(toDate) &&
            Date.parse(fetchedRows[k].date) >= Date.parse(fromDate) &&
            defectMode == fetchedRows[k].mode
          ) {
            defectsCount += fetchedRows[k].defectcount;
            bodyNumberData.push(fetchedRows[k].body_number);
          }
        }
        queryResult[key].push(defectsCount);
      }
    }

    res.end(
      JSON.stringify({
        status: 'success',
        uniqueBodyNumberData: Array.from(new Set(bodyNumberData)),
        data: queryResult,
      })
    );
  } catch (err) {
    console.log(err);
  }
});

app.post('/majorDefectDetail', async (req, res) => {
  try {
    const majorDefectsInAllGroup = req.body.majorDefectsInAllGroup;
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;
    const defectMode = req.body.mode;
    // console.log(majorDefectsInAllGroup);

    function filter(fetchedRows, defectName) {
      const defectObject = {
        Surface: {
          Dent: 0,
          Bump: 0,
          Burrs: 0,
          Spatters: 0,
          Others: 0,
        },
        'Body Fitting': {
          'Body Fitting 1': 0,
          'Body Fitting 2': 0,
          'Body Fitting Others': 0,
        },
        'Missing & Wrong Part': {
          'Missing Part': 0,
          'Wrong Part': 0,
        },
        Welding: {
          'Welding Part 1': 0,
          'Welding Part 2': 0,
          'Welding Part 3': 0,
          'Welding Part Others': 0,
        },
        'Water Leak': {
          'Water Leak 1': 0,
          'Water Leak 2': 0,
          'Water Leak Others': 0,
        },
      };

      let tempDataStoringObj = defectObject[defectName];

      fetchedRows.map((record) => {
        if (
          Date.parse(record.date) <= Date.parse(toDate) &&
          Date.parse(record.date) >= Date.parse(fromDate) &&
          defectMode == record.mode
        ) {
          tempDataStoringObj[record.subdefect] += record.defectcount;
        }
      });

      return tempDataStoringObj;
    }

    async function dataFetcher(groupCode) {
      let dbConnectedPool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'data_entry_systems',
        password: 'admin',
        port: 5432,
      });

      switch (groupCode) {
        case 'UB':
          const data1 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE category='UNDER BODY' and defect='${majorDefectsInAllGroup['UB']}';`
          );
          const data1response = filter(
            data1.rows,
            majorDefectsInAllGroup['UB']
          );
          // console.log('dataUB', data1response);
          return data1response;
        case 'MB':
          const data2 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE (category='LH MAIN BODY' or category='RH MAIN BODY') and defect='${majorDefectsInAllGroup['MB']}'`
          );
          const data2response = filter(
            data2.rows,
            majorDefectsInAllGroup['MB']
          );
          // console.log('dataMB', data2response);
          return data2response;
        case 'SB SA':
          const data3 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE (category='LH SHELL BODY SUB-LINE' or category='RH SHELL BODY SUB-LINE') and defect='${majorDefectsInAllGroup['SB SA']}'`
          );
          const data3response = filter(
            data3.rows,
            majorDefectsInAllGroup['SB SA']
          );
          // console.log('dataSB SA', data3response);
          return data3response;
        case 'SB ML':
          const data4 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE (category='LH SHELL BODY MAIN-LINE' or category='RH SHELL BODY MAIN-LINE') and defect='${majorDefectsInAllGroup['SB ML']}'`
          );
          const data4reponse = filter(
            data4.rows,
            majorDefectsInAllGroup['SB ML']
          );
          // console.log('dataSB ML', data4reponse);
          return data4reponse;
        case 'SM':
          const data5 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE (category='LEFT SIDE MEMBER' or category='RH SIDE MEMBER') and defect='${majorDefectsInAllGroup['SM']}'`
          );
          const data5response = filter(
            data5.rows,
            majorDefectsInAllGroup['SM']
          );
          // console.log('dataSM', data5response);
          return data5response;
        default:
          break;
      }
    }

    let majorDefectsDataInAllGroup = {
      UB: await dataFetcher('UB'),
      MB: await dataFetcher('MB'),
      'SB SA': await dataFetcher('SB SA'),
      'SB ML': await dataFetcher('SB ML'),
      SM: await dataFetcher('SM'),
    };

    // console.log(majorDefectsDataInAllGroup);

    let response = {
      status: 'success',
      data: majorDefectsDataInAllGroup,
    };

    res.send(JSON.stringify(response));
  } catch (err) {
    console.log(err);
  }
});

app.post('/majorSubDefectDetail', async (req, res) => {
  try {
    const majorSubDefectsInAllGroup = req.body.majorSubDefectsInAllGroup;
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;
    const defectMode = req.body.mode;

    async function dataFetcher(groupCode, subDefectName) {
      let dbConnectedPool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'data_entry_systems',
        password: 'admin',
        port: 5432,
      });

      switch (groupCode) {
        case 'UB':
          const data1 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE category='UNDER BODY' and subdefect='${subDefectName}';`
          );
          return data1.rows;
        case 'MB':
          const data2 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE (category='LH MAIN BODY' or category='RH MAIN BODY') and subdefect='${subDefectName}'`
          );
          return data2.rows;
        case 'SB SA':
          const data3 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE (category='LH SHELL BODY SUB-LINE' or category='RH SHELL BODY SUB-LINE') and subdefect='${subDefectName}'`
          );
          return data3.rows;
        case 'SB ML':
          const data4 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE (category='LH SHELL BODY MAIN-LINE' or category='RH SHELL BODY MAIN-LINE') and subdefect='${subDefectName}'`
          );
          return data4.rows;
        case 'SM':
          const data5 = await dbConnectedPool.query(
            `SELECT * FROM defect_table WHERE (category='LEFT SIDE MEMBER' or category='RH SIDE MEMBER') and subdefect='${subDefectName}'`
          );
          return data5.rows;
        default:
          break;
      }
    }

    let responseObject = {};
    async function responseGenerator() {
      await Promise.all(
        Object.keys(majorSubDefectsInAllGroup).map(async (groupCode) => {
          let result = await dataFetcher(
            groupCode,
            Object.keys(majorSubDefectsInAllGroup[groupCode])[0]
          );
          if (result.length != 0) {
            result.map((singleRecord, index) => {
              if (
                Date.parse(singleRecord.date) <= Date.parse(toDate) &&
                Date.parse(singleRecord.date) >= Date.parse(fromDate) &&
                defectMode == singleRecord.mode
              ) {
                let path =
                  groupCode +
                  '.' +
                  singleRecord.subcategory +
                  '.' +
                  '_' +
                  singleRecord.zone;
                mod.set(responseObject, path, singleRecord.defectcount);
              }
            });
          } else {
            responseObject[groupCode] = {};
          }
        })
      );
    }
    responseGenerator().then(() => {
      res.send(
        JSON.stringify({
          status: 'success',
          data: responseObject,
        })
      );
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/pareto', async (req, res) => {
  try {
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;
    const defectMode = req.body.mode;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let dataFetcher = {};

    const records = await dbConnectedPool.query(`SELECT * FROM defect_table`);
    records.rows.map((record) => {
      if (
        Date.parse(record.date) <= Date.parse(toDate) &&
        Date.parse(record.date) >= Date.parse(fromDate) &&
        defectMode == record.mode
      ) {
        switch (record.category) {
          case 'UNDER BODY':
            mod.set(
              dataFetcher,
              [
                'UB',
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;

          case 'RH MAIN BODY':
            mod.set(
              dataFetcher,
              [
                'MB',
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;

          case 'LH MAIN BODY':
            mod.set(
              dataFetcher,
              [
                'MB',
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;

          case 'RH SHELL BODY SUB-LINE':
            mod.set(
              dataFetcher,
              [
                'SBSA',
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;

          case 'LH SHELL BODY SUB-LINE':
            mod.set(
              dataFetcher,
              [
                'SBSA',
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;

          case 'RH SHELL BODY MAIN-LINE':
            mod.set(
              dataFetcher,
              [
                'SBML',
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;

          case 'LH SHELL BODY MAIN-LINE':
            mod.set(
              dataFetcher,
              [
                'SBML',
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;

          case 'RH SIDE MEMBER':
            mod.set(
              dataFetcher,
              [
                'SM',
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;

          case 'LH SIDE MEMBER':
            mod.set(
              dataFetcher,
              [
                'SM',
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;

          default:
            mod.set(
              dataFetcher,
              [
                record.category,
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + String(record.body_number),
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
            break;
        }
      }
    });
    // console.log('dataFetcher', dataFetcher);

    let response = {
      message: 'success',
      data: dataFetcher,
    };

    res.send(JSON.stringify(response));
  } catch (err) {
    console.log(err);
  }
});

app.post('/colorMap', async (req, res) => {
  try {
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;
    const defectMode = req.body.mode;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const groupCode = {
      'UNDER BODY': 'UB',
      'RH MAIN BODY': 'MB',
      'LH MAIN BODY': 'MB',
      'LH SHELL BODY SUB-LINE': 'SBSA',
      'RH SHELL BODY SUB-LINE': 'SBSA',
      'LH SHELL BODY MAIN-LINE': 'SBML',
      'RH SHELL BODY MAIN-LINE': 'SBML',
      'LH SIDE MEMBER': 'SM',
      'RH SIDE MEMBER': 'SM',
    };

    let dataFetcher = {};

    const records = await dbConnectedPool.query(`SELECT * FROM defect_table`);
    records.rows.map((record, index) => {
      if (
        Date.parse(record.date) <= Date.parse(toDate) &&
        Date.parse(record.date) >= Date.parse(fromDate) &&
        defectMode == record.mode
      ) {
        try {
          if (
            dataFetcher[groupCode[record.category]][record.subcategory][
              record.defect
            ][record.subdefect]['_' + String(record.zone)]
          ) {
            dataFetcher[groupCode[record.category]][record.subcategory][
              record.defect
            ][record.subdefect]['_' + String(record.zone)] +=
              record.defectcount;
          } else {
            mod.set(
              dataFetcher,
              [
                groupCode[record.category],
                record.subcategory,
                record.defect,
                record.subdefect,
                '_' + record.zone,
              ].join('.'),
              record.defectcount
            );
          }
        } catch {
          mod.set(
            dataFetcher,
            [
              groupCode[record.category],
              record.subcategory,
              record.defect,
              record.subdefect,
              '_' + record.zone,
            ].join('.'),
            record.defectcount
          );
        }
      }
    });
    // console.log('color Map dataFetcher', dataFetcher);

    delete dataFetcher[''];

    let response = {
      message: 'success',
      data: dataFetcher,
    };

    res.send(JSON.stringify(response));
  } catch (err) {
    console.log(err);
  }
});

app.post('/individualSummaryReport', async (req, res) => {
  try {
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;
    const defectMode = req.body.mode;
    const defectName = req.body.defectName;
    const subDefectList = req.body.subDefectList;
    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const groupCode = {
      'RH MAIN BODY': 'MB',
      'LH MAIN BODY': 'MB',
      'LH SHELL BODY SUB-LINE': 'SBSA',
      'RH SHELL BODY SUB-LINE': 'SBSA',
      'LH SHELL BODY MAIN-LINE': 'SBML',
      'RH SHELL BODY MAIN-LINE': 'SBML',
      'LH SIDE MEMBER': 'SM',
      'RH SIDE MEMBER': 'SM',
    };

    let dataFetcher = {};

    Object.keys(Options).map((category) => {
      ['LH', 'RH'].map((side) => {
        Object.keys(Options[category]).map((subCategory) => {
          subDefectList.map((subDefect) => {
            let categoryName = category.replace('LH ', '').replace('RH ', '');
            let subCategoryCleaner = subCategory
              .replace(groupCode[category], '')
              .replace('LH', '')
              .replace('RH', '');
            let subCategoryName = subCategoryCleaner.slice(
              0,
              subCategoryCleaner.length - 4
            );
            mod.set(
              dataFetcher,
              [categoryName, side, subCategoryName, subDefect].join('.'),
              0
            );
          });
        });
      });
    });

    // deleting Under Body
    delete dataFetcher['UNDER BODY'];

    const records = await dbConnectedPool.query(
      `SELECT * FROM defect_table WHERE (NOT category='UNDER BODY') AND defect='${defectName}'`
    );

    records.rows.map((record) => {
      if (
        Date.parse(record.date) <= Date.parse(toDate) &&
        Date.parse(record.date) >= Date.parse(fromDate) &&
        defectMode == record.mode
      ) {
        let side = record.category.split(' ')[0];
        let categoryNameParts = record.category.split(' ');
        categoryNameParts.shift();
        let categoryName = categoryNameParts.join(' ');
        let subCategoryCleaner = record.subcategory
          .replace(groupCode[record.category], '')
          .replace(side, '');
        let subCategoryName = subCategoryCleaner.slice(
          0,
          subCategoryCleaner.length - 4
        );

        // console.log('side: ', side);
        // console.log('categoryName: ', categoryName);
        // console.log('subCategoryName: ', subCategoryName);

        try {
          if (
            dataFetcher[categoryName][side][subCategoryName][record.subdefect]
          ) {
            dataFetcher[categoryName][side][subCategoryName][
              record.subdefect
            ] += record.defectcount;
          } else {
            mod.set(
              dataFetcher,
              [categoryName, side, subCategoryName, record.subdefect].join('.'),
              record.defectcount
            );
          }
        } catch {
          mod.set(
            dataFetcher,
            [categoryName, side, subCategoryName, record.subdefect].join('.'),
            record.defectcount
          );
        }
      }
    });

    // console.log('data Fetcher: ', dataFetcher);

    res.send(
      JSON.stringify({
        status: 'success',
        data: dataFetcher,
      })
    );
  } catch (err) {
    console.log(err);
  }
});

app.post('/admin', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;
    console.log('companyName: ', companyName);

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let response = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE company='${companyName}'`
    );

    const employeeRecords = response.rows.sort((r1, r2) =>
      r1.id > r2.id ? 1 : r1.id < r2.id ? -1 : 0
    );

    const response2 = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE id=${currentEmpID} AND company='${companyName}'`
    );

    const emp_ChartAccess = response2.rows[0].accessible_charts;
    const emp_Status = response2.rows[0].status;
    const emp_Company = response2.rows[0].company;

    res.render(path.join(__dirname, '/views/adminPage.ejs'), {
      currentUser,
      currentEmpID,
      employeeRecords,
      emp_ChartAccess,
      emp_Status,
      companyName,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/updateEmpStatus', async (req, res) => {
  try {
    const changeEmpID = req.body.changeEmpID;
    const changeEmpName = req.body.changeEmpName;
    const changeEmpStatus = req.body.changeEmpStatus;

    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.current_Emp_ID;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    const response = dbConnectedPool.query(
      `UPDATE employee_table SET status='${changeEmpStatus}' WHERE id=${changeEmpID}`
    );

    await dbConnectedPool.query(
      `INSERT INTO admin_activity_table (doneByID,doneByName,activity,doneToID,doneToName,date,time) VALUES (${currentEmpID},'${currentUser}','updated status to ${changeEmpStatus}',${changeEmpID},'${changeEmpName}','${date}','${time}')`
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post('/updateEmpChartAccess', async (req, res) => {
  try {
    const changeEmpID = req.body.changeEmpID;
    const changeEmpName = req.body.changeEmpName;
    const selectedChartAccess = req.body.selectedChartAccess;

    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    const response = dbConnectedPool.query(
      `UPDATE employee_table SET accessible_charts= ARRAY['${selectedChartAccess.join(
        `','`
      )}'] WHERE id=${changeEmpID}`
    );

    await dbConnectedPool.query(
      `INSERT INTO admin_activity_table (doneByID,doneByName,activity,doneToID,doneToName,date,time) VALUES (${currentEmpID},'${currentUser}','updated report access',${changeEmpID},'${changeEmpName}','${date}','${time}')`
    );

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
});

app.post('/adminLog', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const response2 = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE id=${currentEmpID};`
    );

    const emp_ChartAccess = response2.rows[0].accessible_charts;
    const emp_Status = response2.rows[0].status;

    const adminActivityRecords = await dbConnectedPool.query(
      'SELECT * FROM admin_activity_table;'
    );

    res.render(path.join(__dirname, '/views/adminLog.ejs'), {
      currentUser,
      currentEmpID,
      emp_ChartAccess,
      emp_Status,
      companyName,
      adminActivityRecords: adminActivityRecords.rows.reverse(),
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/dashboard', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;

    console.log('dashboard');
    console.log('companyName: ', companyName);

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const response2 = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE id=${currentEmpID};`
    );

    const emp_ChartAccess = response2.rows[0].accessible_charts;
    const emp_Status = response2.rows[0].status;

    res.render(path.join(__dirname, '/views/liveDashboard.ejs'), {
      currentUser,
      currentEmpID,
      emp_ChartAccess,
      emp_Status,
      companyName,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/liveData', async (req, res) => {
  try {
    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const time =
      String(currentDate.getHours()) +
      ':' +
      String(currentDate.getMinutes()) +
      ':' +
      String(currentDate.getSeconds());

    // things which are needed
    // total no of cars, defects, individual defect count
    const defectResponse = await dbConnectedPool.query(
      `SELECT * FROM defect_table WHERE date='${date}'`
    );

    // console.log('defectResponse: ', defectResponse);

    // online
    let bodyNumberArrayOnline = [];
    let defectCountOnline = 0;
    let individualDefectCountOnline = {
      Surface: 0,
      'Body Fitting': 0,
      'Missing & Wrong Part': 0,
      Welding: 0,
      'Water Leak': 0,
    };

    // offline
    let bodyNumberArrayOffline = [];
    let defectCountOffline = 0;
    let individualDefectCountOffline = {
      Surface: 0,
      'Body Fitting': 0,
      'Missing & Wrong Part': 0,
      Welding: 0,
      'Water Leak': 0,
    };

    let employeeDefectResponseData = [];

    let recordDataTemp = {
      empid: defectResponse.rows[0].empid,
      username: defectResponse.rows[0].username,
      body_number: defectResponse.rows[0].body_number,
      defectcount: defectResponse.rows[0].defectcount,
      time: defectResponse.rows[0].time,
    };

    defectResponse.rows.map((record, index) => {
      if (record.mode == 'online') {
        // for unique bodyNumber
        bodyNumberArrayOnline.push(record.body_number);
        // for total defect count
        defectCountOnline += record.defectcount;
        // for individual defect count
        individualDefectCountOnline[record.defect] += record.defectcount;
      } else {
        // for unique bodyNumber
        bodyNumberArrayOffline.push(record.body_number);
        // for total defect count
        defectCountOffline += record.defectcount;
        // for individual defect count
        individualDefectCountOffline[record.defect] += record.defectcount;
      }

      // for employee defect log table
      if (index != 0) {
        if (
          record.empid == recordDataTemp.empid &&
          record.body_number == recordDataTemp.body_number &&
          record.time == recordDataTemp.time
        ) {
          recordDataTemp.defectcount += record.defectcount;
        } else {
          employeeDefectResponseData.push(
            JSON.parse(JSON.stringify(recordDataTemp))
          );

          recordDataTemp.empid = record.empid;
          recordDataTemp.username = record.username;
          recordDataTemp.body_number = record.body_number;
          recordDataTemp.defectcount = record.defectcount;
          recordDataTemp.time = record.time;
        }
      }

      if (index == defectResponse.rows.length - 1) {
        employeeDefectResponseData.push(recordDataTemp);
      }
    });

    // console.log('data: ', employeeDefectResponseData);

    const uniqueBodyNumberOnline = [...new Set(bodyNumberArrayOnline)];
    const uniqueBodyNumberOffline = [...new Set(bodyNumberArrayOffline)];

    res.send(
      JSON.stringify({
        uniqueBodyNumberOnline,
        defectCountOnline,
        individualDefectCountOnline,
        uniqueBodyNumberOffline,
        defectCountOffline,
        individualDefectCountOffline,
        employeeDefectResponse: employeeDefectResponseData.reverse(),
      })
    );
  } catch (err) {
    res.send(
      JSON.stringify({
        uniqueBodyNumber: [],
        defectCount: 0,
        individualDefectCount: {
          Surface: 0,
          'Body Fitting': 0,
          'Missing & Wrong Part': 0,
          Welding: 0,
          'Water Leak': 0,
        },
        employeeDefectResponse: [],
      })
    );
  }
});

app.post('/liveNotification', async (req, res) => {
  try {
    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    // console.log('----------------- liveNotification ----------------');

    let currentDate = new Date();
    const date =
      String(currentDate.getFullYear()) +
      '-' +
      (currentDate.getMonth() + 1 <= 9
        ? '0' + Number(currentDate.getMonth() + 1)
        : Number(currentDate.getMonth() + 1)) +
      '-' +
      (currentDate.getDate() <= 9
        ? '0' + Number(currentDate.getDate())
        : Number(currentDate.getDate()));

    const codedTiming = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      currentDate.getDate(),
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds(),
      0
    );

    const subbedTime = new Date(codedTiming - 5000);

    const defectResponse = await dbConnectedPool.query(
      `SELECT * FROM defect_table WHERE date='${date}'`
    );

    let recordDataTemp = {
      empid: 0,
      username: '',
      body_number: 0,
      defectcount: 0,
      time: '',
    };

    let liveNotificationData = [];

    let flag = false;
    defectResponse.rows.map((record, index) => {
      const recordDate = record.date.split('-');
      const recordTime = record.time.split(':');

      const recordTiming = new Date(
        recordDate[0],
        recordDate[1],
        recordDate[2],
        recordTime[0],
        recordTime[1],
        recordTime[2]
      );

      if (recordTiming >= subbedTime) {
        if (flag) {
          if (
            record.empid == recordDataTemp.empid &&
            record.body_number == recordDataTemp.body_number &&
            record.time == recordDataTemp.time
          ) {
            recordDataTemp.defectcount += record.defectcount;
          } else {
            liveNotificationData.push(
              JSON.parse(JSON.stringify(recordDataTemp))
            );

            recordDataTemp.empid = record.empid;
            recordDataTemp.username = record.username;
            recordDataTemp.body_number = record.body_number;
            recordDataTemp.defectcount = record.defectcount;
            recordDataTemp.time = record.time;
          }
        } else {
          recordDataTemp.empid = record.empid;
          recordDataTemp.username = record.username;
          recordDataTemp.body_number = record.body_number;
          recordDataTemp.defectcount = record.defectcount;
          recordDataTemp.time = record.time;
          flag = true;
        }

        if (index == defectResponse.rows.length - 1) {
          liveNotificationData.push(recordDataTemp);
        }
      }
    });

    // console.log('liveNotificationData: ', liveNotificationData);

    res.send(
      JSON.stringify({
        liveNotificationData,
      })
    );
  } catch (err) {
    res.send(
      JSON.stringify({
        liveNotificationData: [],
      })
    );
  }
});

app.post('/selectPack', (req, res) => {
  try {
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;

    res.render(path.join(__dirname, '/views/selectPack.ejs'));
  } catch (err) {
    console.log(err);
  }
});

app.post('/profile', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;

    console.log('userProfile');

    console.log('currentUser: ', currentUser);
    console.log('currentEmpID: ', currentEmpID);
    console.log('companyName: ', companyName);

    /// have to pass companyName along with user and id

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const companyResponse = await dbConnectedPool.query(
      `SELECT * FROM company_table WHERE name='${companyName}'`
    );

    const employeeResponse = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE id=${currentEmpID} AND company='${companyName}';`
    );

    const employeeDetail = {
      name: employeeResponse.rows[0].name,
      id: employeeResponse.rows[0].id,
      email: employeeResponse.rows[0].email,
      company: employeeResponse.rows[0].company,
      accessible_charts: employeeResponse.rows[0].accessible_charts,
      status: employeeResponse.rows[0].status,
      created_by: employeeResponse.rows[0].created_by,
    };

    const companyDetail = {
      name: companyResponse.rows[0].name,
      body_number: companyResponse.rows[0].body_number,
      used: companyResponse.rows[0].used,
      remaining: companyResponse.rows[0].remaining,
    };

    res.render(path.join(__dirname, '/views/userProfile.ejs'), {
      currentUser,
      currentEmpID,
      companyName,
      companyDetail,
      employeeDetail,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post('/updatePassword', async (req, res) => {
  try {
    const currentPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const empCompany = req.body.empCompany;
    const empID = req.body.empID;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const userResponse = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE id=${empID} AND company='${empCompany}'`
    );

    const userData = userResponse.rows[0];

    if (currentPassword == userData.password) {
      if (currentPassword == newPassword) {
        res.send(
          JSON.stringify({
            status: 'failure',
            type: 'same password',
          })
        );
      } else {
        await dbConnectedPool.query(
          `UPDATE employee_table SET password='${newPassword}' WHERE id=${empID} AND company='${empCompany}'`
        );

        res.send(
          JSON.stringify({
            status: 'success',
            type: 'password updated',
          })
        );
      }
    } else {
      res.send(
        JSON.stringify({
          status: 'failure',
          type: 'Invalid current password',
        })
      );
    }
  } catch (err) {
    console.log(err);
    res.send(
      JSON.stringify({
        status: 'failure',
        type: 'backend error',
      })
    );
  }
});

app.post('/checkout', async (req, res) => {
  try {
    // let fname = req.body.first_name;
    // let lname = req.body.last_name;
    // let amount = req.body.tree;
    // let tname = req.body.tname;
    // let email = req.body.email;
    let tid = uniqId();

    var instance = new Razorpay({
      key_id: 'rzp_test_Ba9dKThqzF925j',
      key_secret: 'vnkPGoKUQeOWalRtqOmTjCSk',
    });

    const format = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date();

    let options = await instance.orders.create({
      amount: 500 * 100,
      currency: 'INR',
      receipt: uniqId(),
      function(err, ordre) {
        console.log(order);
        res.send({ orderId: options.id });
      },
    });

    console.log(options);

    const requests = new Request({
      name: fullName,
      tid: tid,
      tname: Deevia,
      date: date.toLocaleDateString('en-US', format),
    });
    const generated = await requests.save();
    console.log('Added data');
    console.log('Request Generated');
    res.render('final_checkout');
  } catch (err) {
    console.log(err);
  }
});

app.post('/updateSection', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.body.currentUser;
    const currentEmpID = req.body.currentEmpID;
    const companyName = req.body.companyName;

    let dbConnectedPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'data_entry_systems',
      password: 'admin',
      port: 5432,
    });

    const response = await dbConnectedPool.query(
      `SELECT * FROM employee_table WHERE id=${currentEmpID};`
    );

    const accessibleReport = response.rows[0].accessible_charts;
    const emp_Status = response.rows[0].status;

    res.render(path.join(__dirname, '/views/updateSection.ejs'), {
      currentUser,
      currentEmpID,
      companyName,
      emp_ChartAccess: accessibleReport,
      emp_Status,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get('/logout', (req, res) => {
  try {
    res.redirect('/');
  } catch (err) {
    console.log(err);
  }
});

app.listen(2000, () => {
  console.log(
    'Data Entry tool running on port 2000. Go to Browser and search for postgres:2000 to open.'
  );
});
