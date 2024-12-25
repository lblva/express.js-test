import indexRoute from './routes/index.js';
import messagesRoute from './routes/messages.js';
import usersRoute from './routes/users.js';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from './models/User.js';
import mongoose from 'mongoose';
import plantsRoute from './routes/plants.js';
import logsRoute from './routes/logs.js';

dotenv.config();
const app = express();

app.use(express.json());


// Configure session middleware
app.use(session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      },
    }),
  );
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://express-js-test-ncc6.onrender.com/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });
  
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: email,
          profilePicture: profile.photos[0]?.value || '', // Save profile picture if available

        });
      }else if (!user.profilePicture) {
        // Update profile picture if it wasn't stored previously
        user.profilePicture = profile.photos[0]?.value || '';
        await user.save();
      }
  
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
  
  // Serialize and deserialize user
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected toDatabase'));


app.use('/', indexRoute); // zo importeer ik de model files 
app.use('/messages', messagesRoute);
app.use('/users', usersRoute); 
app.use('/plants', plantsRoute);
app.use('/logs', logsRoute);


// Google Authentication Routes
app.get('/auth/google', (req, res, next) => {
    const redirectUri = req.query.redirectUri;
  
    const authOptions = {
      scope: ['profile', 'email'],
      state: JSON.stringify({ redirectUri }) // Encode redirectUri in state
    };
    
    passport.authenticate('google', authOptions)(req, res, next);
  });
  
  app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      const user = req.user;
      
      const { redirectUri } = JSON.parse(req.query.state); // Retrieve from state
      const fallbackUri = 'exp://localhost:19000';
  
      const userInfo = {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture, // Include profile picture in the response
      };
  
      const redirectUrl = `${redirectUri || fallbackUri}?user=${encodeURIComponent(JSON.stringify(userInfo))}`;
      res.redirect(redirectUrl);
    }
  );


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
