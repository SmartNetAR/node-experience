import IFileRepository from '../../InterfaceAdapters/IFileRepository';
import {getRepository, Repository} from 'typeorm';
import {injectable} from 'inversify';
import {ICriteria, IPaginator} from '@digichanges/shared-experience';

import Paginator from '../../../App/Presentation/Shared/Paginator';
import FileFilter from '../../Presentation/Criterias/FileFilter';
import FileSchema from '../Schema/FileTypeORM';
import File from '../../Domain/Entities/File';
import IFileDomain from '../../InterfaceAdapters/IFileDomain';

import NotFoundException from '../../../Shared/Exceptions/NotFoundException';

@injectable()
class FileSqlRepository implements IFileRepository
{
    private repository: Repository<File>;

    constructor()
    {
        this.repository = getRepository<File>(FileSchema);
    }

    async save(file: IFileDomain): Promise<File>
    {
        return await this.repository.save(file);
    }

    async getOne(id: string): Promise<File>
    {
        const file = await this.repository.findOne(id);

        if (!file)
        {
            throw new NotFoundException('File');
        }

        return file;
    }

    async list(criteria: ICriteria): Promise<IPaginator>
    {
        const queryBuilder = this.repository.createQueryBuilder('i');

        const filter = criteria.getFilter();

        queryBuilder.where('1 = 1');

        if (filter.has(FileFilter.NAME))
        {
            queryBuilder.andWhere(`i.${  FileFilter.NAME  } like :${  FileFilter.NAME}`);
            queryBuilder.setParameter(FileFilter.NAME, `%${filter.get(FileFilter.NAME)}%`);
        }

        return new Paginator(queryBuilder, criteria);
    }

    async update(file: IFileDomain): Promise<any>
    {
        await this.repository.save(file);
    }

    async delete(id: any): Promise<any>
    {
        return await this.repository.delete(id);
    }

}

export default FileSqlRepository;
