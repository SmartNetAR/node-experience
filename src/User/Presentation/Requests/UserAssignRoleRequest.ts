import * as express from 'express';
import {IsArray, IsUUID} from 'class-validator';

import UserAssignRolePayload from '../../InterfaceAdapters/Payloads/UserAssignRolePayload';
import IdRequest from '../../../App/Presentation/Requests/IdRequest';

class UserAssignRoleRequest extends IdRequest implements UserAssignRolePayload
{
    @IsArray()
    @IsUUID('4', {
        each: true
    })
    rolesId: string[]

    constructor(request: express.Request)
    {
        super(request);
        this.rolesId = request.body.rolesId;
    }

    getRolesId(): string[]
    {
        return this.rolesId;
    }
}

export default UserAssignRoleRequest;
