interface SectionData {
    label: string,
    id: string,
    icon: string,
    filters: Filter[]
};

type FilterType = 'text' | 'number';

interface Filter {
    name: string,
    type: FilterType,
    label: ?string,
    placeholder: ?string,
}