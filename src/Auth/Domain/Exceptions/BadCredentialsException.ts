import {ErrorException} from '@digichanges/shared-experience';
import {Locales} from '../../../app';

class BadCredentialsException extends ErrorException
{
    constructor()
    {
        super(Locales.__('general.exceptions.badCredentials'), BadCredentialsException.name);
    }
}

export default BadCredentialsException;
