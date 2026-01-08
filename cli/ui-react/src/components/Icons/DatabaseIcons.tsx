import {
    SiPostgresql,
    SiMysql,
    SiMongodb,
    SiSnowflake,
    SiDatabricks,
    SiClickhouse,
    SiShopify,
    SiGooglebigquery,
    SiAmazonredshift
} from 'react-icons/si';
import { FaLink, FaDatabase, FaFileCsv } from 'react-icons/fa';
import { ConnectionType } from '../../types';

interface DatabaseIconProps {
    type: ConnectionType;
    size?: number;
}

const iconConfig: Record<ConnectionType, { icon: React.ComponentType<{ size?: number; color?: string }>; color: string }> = {
    postgresql: { icon: SiPostgresql, color: '#336791' },
    mysql: { icon: SiMysql, color: '#4479A1' },
    mongodb: { icon: SiMongodb, color: '#47A248' },
    snowflake: { icon: SiSnowflake, color: '#29B5E8' },
    databricks: { icon: SiDatabricks, color: '#FF3621' },
    clickhouse: { icon: SiClickhouse, color: '#FFCC01' },
    sqlserver: { icon: FaDatabase, color: '#CC2927' },
    shopify: { icon: SiShopify, color: '#7AB55C' },
    bigquery: { icon: SiGooglebigquery, color: '#669DF6' },
    redshift: { icon: SiAmazonredshift, color: '#8C4FFF' },
    csv: { icon: FaFileCsv, color: '#217346' },
    custom: { icon: FaLink, color: '#6B7280' },
};

export function DatabaseIcon({ type, size = 32 }: DatabaseIconProps) {
    const config = iconConfig[type] || { icon: FaDatabase, color: '#6B7280' };
    const IconComponent = config.icon;

    return <IconComponent size={size} color={config.color} />;
}

export function getDatabaseName(type: ConnectionType): string {
    const names: Record<ConnectionType, string> = {
        postgresql: 'PostgreSQL',
        mysql: 'MySQL',
        mongodb: 'MongoDB',
        snowflake: 'Snowflake',
        databricks: 'Databricks',
        clickhouse: 'ClickHouse',
        sqlserver: 'SQL Server',
        shopify: 'Shopify',
        bigquery: 'BigQuery',
        redshift: 'Redshift',
        csv: 'CSV File',
        custom: 'Custom',
    };
    return names[type] || type;
}

export const databaseTypes: ConnectionType[] = [
    'custom',
    'postgresql',
    'mysql',
    'sqlserver',
    'bigquery',
    'snowflake',
    'redshift',
    'databricks',
    'clickhouse',
    'mongodb',
    'shopify',
    'csv',
];
