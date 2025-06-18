
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import type { DailySales } from '@/types';

const DailySalesDashboard = () => {
  const [todaysSales, setTodaysSales] = useState<DailySales | null>(null);
  const [historicalSales, setHistoricalSales] = useState<DailySales[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysSales();
    fetchRecentSales();
  }, []);

  const fetchTodaysSales = async () => {
    try {
      const sales = await supabaseService.getTodaysSales();
      setTodaysSales(sales);
    } catch (error) {
      console.error('Error fetching today\'s sales:', error);
    }
  };

  const fetchRecentSales = async () => {
    try {
      const sales = await supabaseService.getDailySales();
      setHistoricalSales(sales.slice(0, 30)); // Last 30 days
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent sales:', error);
      setLoading(false);
    }
  };

  const handleDateRangeSearch = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    try {
      const sales = await supabaseService.getSalesByDateRange(startDate, endDate);
      setHistoricalSales(sales);
    } catch (error) {
      console.error('Error fetching sales by date range:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalHistoricalSales = historicalSales.reduce((sum, sale) => sum + sale.total_sales, 0);
  const totalHistoricalPoints = historicalSales.reduce((sum, sale) => sum + sale.total_points, 0);
  const totalHistoricalOrders = historicalSales.reduce((sum, sale) => sum + sale.total_orders, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daily Sales Dashboard</h2>
        <p className="text-muted-foreground">Track daily sales performance and points awarded</p>
      </div>

      {/* Today's Sales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todaysSales?.total_sales?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {todaysSales?.total_orders || 0} orders today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysSales?.total_points || 0}</div>
            <p className="text-xs text-muted-foreground">Points awarded today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysSales?.total_orders || 0}</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Sales</CardTitle>
          <CardDescription>View sales data for specific date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end mb-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="start-date" className="text-sm font-medium">Start Date</label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="end-date" className="text-sm font-medium">End Date</label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleDateRangeSearch} disabled={!startDate || !endDate}>
              <Calendar className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">₹{totalHistoricalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total Sales</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalHistoricalPoints}</div>
                <p className="text-xs text-muted-foreground">Total Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{totalHistoricalOrders}</div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
          </div>

          {/* Historical Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sales (₹)</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Avg Order Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : historicalSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No sales data found</TableCell>
                  </TableRow>
                ) : (
                  historicalSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{formatDate(sale.sale_date)}</TableCell>
                      <TableCell>₹{sale.total_sales.toFixed(2)}</TableCell>
                      <TableCell>{sale.total_points}</TableCell>
                      <TableCell>{sale.total_orders}</TableCell>
                      <TableCell>
                        ₹{sale.total_orders > 0 ? (sale.total_sales / sale.total_orders).toFixed(2) : '0.00'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySalesDashboard;
