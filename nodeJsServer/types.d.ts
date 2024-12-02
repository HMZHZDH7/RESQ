interface ISectionData {
    label: string,
    id: string,
    icon: string,
    filters: IFilter[]
};

type FilterType = 'text' | 'number';

interface IFilter {
    name: string,
    type: FilterType,
    label: ?string,
    placeholder: ?string,
}