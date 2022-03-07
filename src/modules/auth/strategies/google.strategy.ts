import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      scope: ['email', 'profile'],
      clientID: configService.get('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
      callbackURL: `${configService.get('API_BASE_URL')}/auth/google/callback`
    })
  }

  /*
   | This function is called on 2 circunstances 
   |  
   | 1- When dealing with the initial request to the google authentication endpoint 
   | rastercar.com/auth/google/authenticate. in this case we just pass the needed
   | state and let to the strategy authentificate with google
   | 
   | 2- When dealing with the request redirection from a sucessfull google oauth attempt
   | 
   */
  async authenticate(req: Request) {
    const forExistingUser = req.query.forExistingUser

    // Pass the existing user token to the state prop so after google authentificates
    // the request it will return the existing user token on the request query this is
    // the only way to preserve the token needed to authenticate the rastercar user
    // between the redirects state

    // see: https://developers.google.com/identity/protocols/oauth2/web-server#httprest_1
    if (forExistingUser) {
      // If we need to pass more than a simple string to the state use bellow:
      // base64url(JSON.stringify({ some: 'complex_state' }))
      return super.authenticate(req, { state: forExistingUser })
    }

    return super.authenticate(req)
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    done(null, profile)
  }
}
