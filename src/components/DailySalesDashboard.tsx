import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { getDailySales } from '@/services/supabaseService';
import { Calendar, TrendingUp, ShoppingCart, Award } from 'lucide-react';

interface DailySalesData {
  sale_date: string;
  total_sales: number;
  total_orders: number;
  total_points: number;
}

const DailySalesDashboard = () => {
  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDailySales();
  }, []);

  const fetchDailySales = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailySales();
      setDailySales(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily sales data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          Loading daily sales data...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-red-500">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Recent Sales
          </CardTitle>
          <CardDescription>Overview of recent sales activity</CardDescription>
        </CardHeader>
        <CardContent>
          {dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sale_date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4">No sales data available.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Points vs Orders
          </CardTitle>
          <CardDescription>Comparison of points earned and orders placed</CardDescription>
        </CardHeader>
        <CardContent>
          {dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sale_date" tickFormatter={formatDate} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="total_points" stroke="#82ca9d" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="total_orders" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-4">No data available to compare.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySalesDashboard;
