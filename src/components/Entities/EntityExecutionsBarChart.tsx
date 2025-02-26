import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { formatDateUTC, millisecondsToHMS } from 'common/formatters';
import { timestampToDate } from 'common/utils';
import { BarChart } from 'components/common/BarChart';
import { WaitForData } from 'components/common/WaitForData';
import { useWorkflowExecutionFiltersState } from 'components/Executions/filters/useExecutionFiltersState';
import { useWorkflowExecutions } from 'components/hooks/useWorkflowExecutions';
import { SortDirection } from 'models/AdminEntity/types';
import { ResourceIdentifier } from 'models/Common/types';
import { Execution, WorkflowExecutionIdentifier } from 'models/Execution/types';
import { executionSortFields } from 'models/Execution/constants';
import { Routes } from 'routes/routes';
import { history } from 'routes/history';
import { executionFilterGenerator } from './generators';
import {
    getWorkflowExecutionPhaseConstants,
    getWorkflowExecutionTimingMS
} from '../Executions/utils';

const useStyles = makeStyles((theme: Theme) => ({
    header: {
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        borderBottom: `1px solid ${theme.palette.divider}`
    },
    body: {
        margin: theme.spacing(1)
    }
}));

export interface EntityExecutionsBarChartProps {
    id: ResourceIdentifier;
    onToggle: (id: string) => void;
    chartIds: string[];
}

const getExecutionTimeData = (executions: Execution[], fillSize = 100) => {
    const newExecutions = [...executions].reverse().map(execution => {
        const duration = getWorkflowExecutionTimingMS(execution)?.duration || 1;
        return {
            value: duration,
            color: getWorkflowExecutionPhaseConstants(execution.closure.phase)
                .badgeColor,
            metadata: execution.id,
            tooltip: (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>
                        Execution Id: <strong>{execution.id.name}</strong>
                    </span>
                    <span>Running time: {millisecondsToHMS(duration)}</span>
                    <span>
                        Started at:{' '}
                        {execution.closure.startedAt != null &&
                            formatDateUTC(
                                timestampToDate(execution.closure.startedAt!)
                            )}
                    </span>
                </div>
            )
        };
    });
    if (newExecutions.length >= fillSize) {
        return newExecutions.slice(0, fillSize);
    }
    return new Array(fillSize - newExecutions.length)
        .fill(0)
        .map(_ => ({
            value: 1,
            color: '#e5e5e5'
        }))
        .concat(newExecutions);
};

const getStartExecutionTime = (executions: Execution[]) => {
    if (executions.length === 0) {
        return '';
    }
    const lastExecution = executions[executions.length - 1];
    if (!lastExecution.closure.startedAt) {
        return '';
    }
    return formatDateUTC(timestampToDate(lastExecution.closure.startedAt));
};

/**
 * The tab/page content for viewing a workflow's executions as bar chart
 * @param id
 * @constructor
 */
export const EntityExecutionsBarChart: React.FC<EntityExecutionsBarChartProps> = ({
    id,
    onToggle,
    chartIds
}) => {
    const styles = useStyles();
    const { domain, project, resourceType } = id;
    const filtersState = useWorkflowExecutionFiltersState();
    const sort = {
        key: executionSortFields.createdAt,
        direction: SortDirection.DESCENDING
    };

    const baseFilters = React.useMemo(
        () => executionFilterGenerator[resourceType](id),
        [id]
    );

    const executions = useWorkflowExecutions(
        { domain, project },
        {
            sort,
            filter: [...baseFilters, ...filtersState.appliedFilters],
            limit: 100
        }
    );

    console.log(executions);

    const handleClickItem = React.useCallback(item => {
        if (item.metadata) {
            onToggle(item.metadata.name);
            // const executionId = item.metadata as WorkflowExecutionIdentifier;
            // history.push(Routes.ExecutionDetails.makeUrl(executionId));
        }
    }, []);

    /** Don't render component until finish fetching user profile */
    if (filtersState.filters[4].status !== 'LOADED') {
        return null;
    }

    return (
        <WaitForData {...executions}>
            <Typography className={styles.header} variant="h6">
                All Executions in the Workflow
            </Typography>
            <div className={styles.body}>
                <BarChart
                    chartIds={chartIds}
                    data={getExecutionTimeData(executions.value)}
                    startDate={getStartExecutionTime(executions.value)}
                    onClickItem={handleClickItem}
                />
            </div>
        </WaitForData>
    );
};
