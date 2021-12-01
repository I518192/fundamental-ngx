import { Rule, Tree, chain, externalSchematic } from '@angular-devkit/schematics';
import { formatFiles } from '@nrwl/workspace';

function getProjectName(directory: string, schema: SapComponentSchema): string {
    return `${schema.project}-${directory}`;
}

function getProjectTag(schema: SapComponentSchema): string {
    return schema.project === 'core' ? 'fd' : 'fdp';
}

export default function (schema: SapComponentSchema): Rule {
    const dashedDirectory = schema.name.replace('/', '-');

    return chain([
        externalSchematic('@nrwl/angular', 'lib', {
            name: schema.name,
            style: 'scss',
            directory: schema.project,
            tags: [getProjectTag(schema)].join(',')
        }),
        externalSchematic('@nrwl/angular', 'component', {
            project: getProjectName(dashedDirectory, schema),
            name: schema.name,
            style: 'scss',
            changeDetection: 'OnPush'
        })
        //   formatFiles()
    ]);
}

interface SapComponentSchema {
    name: string;
    project: 'core' | 'platform';
}
