import {Query} from 'mongoose';
import {ICriteria, IFilter, IPagination, IPaginator, ISort} from '@digichanges/shared-experience';

class MongoPaginator implements IPaginator
{
    private documentQuery: Query<any[], any>;
    private filter: IFilter;
    private sort: ISort;
    private pagination: IPagination;
    private total: number;

    constructor(documentQuery: Query<any[], any>, criteria: ICriteria)
    {
        this.documentQuery = documentQuery;
        this.filter = criteria.getFilter();
        this.sort = criteria.getSort();
        this.pagination = criteria.getPagination();
    }

    public getTotal(): number
    {
        return this.total;
    }

    public getCurrentUrl(): string
    {
        return this.pagination.getCurrentUrl();
    }

    // TODO: Dont show next url when it doesnt exist more data
    public getNextUrl(): string
    {
        return this.pagination.getNextUrl();
    }

    public async paginate(): Promise<any>
    {
        // TODO: Add filter logic

        this.addOrderBy();
        this.addPagination();

        const data = await this.documentQuery.exec();

        this.total = data.length;

        return data;
    }

    public getExist(): boolean
    {
        return this.pagination.getExist();
    }
    // TODO: See when multiple sorts
    private addOrderBy()
    {
        const sorts = this.sort.get();
        const _objectSort = {};

        sorts.forEach((value: string, key: string) =>
        {
            let order: any = value.toUpperCase();
            order = (order === 'DESC') ? -1 : 1;

            const obj = {[key]: order};
            Object.assign(_objectSort, obj);
        });

        void this.documentQuery.sort(_objectSort);
    }

    private addPagination()
    {
        const exist = this.pagination.getExist();

        if (exist)
        {
            void this.documentQuery
                .skip(this.pagination.getOffset())
                .limit(this.pagination.getLimit());
        }
    }
}

export default MongoPaginator;
