
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, TrendingUp, DollarSign, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import type { DailySales } from '@/types';
import { toast } from 'sonner';

const DailySalesDashboard = () => {
  const [todaysSales, setTodaysSales] = useState<DailySales | null>(null);
  const [historicalSales, setHistoricalSales] = useState<DailySales[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching initial sales data...');
      
      // Fetch today's sales
      const todaySales = await supabaseService.getTodaysSales();
      console.log('Today\'s sales:', todaySales);
      setTodaysSales(todaySales);

      // Fetch recent sales (last 30 days)
      const recentSales = await supabaseService.getDailySales();
      console.log('Recent sales:', recentSales);
      
      // Ensure we have valid data and sort by date
      const validSales = (recentSales || [])
        .filter(sale => sale && sale.sale_date)
        .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
        .slice(0, 30);
      
      setHistoricalSales(validSales);
      
      toast.success('Sales data loaded successfully');
    } catch (error) {
      console.error('Error fetching initial sales data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load sales data: ${errorMessage}`);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeSearch = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }
    
    setSearchLoading(true);
    setError(null);
    
    try {
      console.log('Searching sales by date range:', { startDate, endDate });
      const sales = await supabaseService.getSalesByDateRange(startDate, endDate);
      console.log('Date range sales:', sales);
      
      // Ensure we have valid data and sort by date
      const validSales = (sales || [])
        .filter(sale => sale && sale.sale_date)
        .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());
      
      setHistoricalSales(validSales);
      toast.success(`Found ${validSales.length} sales records`);
    } catch (error) {
      console.error('Error fetching sales by date range:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to fetch sales data: ${errorMessage}`);
      toast.error('Failed to fetch sales data for selected date range');
    } finally {
      setSearchLoading(false);
    }
  };

  const resetToRecentSales = async () => {
    setStartDate('');
    setEndDate('');
    setSearchLoading(true);
    setError(null);
    
    try {
      const recentSales = await supabaseService.getDailySales();
      const validSales = (recentSales || [])
        .filter(sale => sale && sale.sale_date)
        .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
        .slice(0, 30);
      
      setHistoricalSales(validSales);
      toast.success('Reset to recent sales data');
    } catch (error) {
      console.error('Error resetting to recent sales:', error);
      setError('Failed to reset sales data');
      toast.error('Failed to reset sales data');
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = Number(amount) || 0;
    return `₹${numAmount.toFixed(2)}`;
  };

  const safeNumber = (value: any): number => {
    return Number(value) || 0;
  };

  // Calculate totals safely
  const totalHistoricalSales = historicalSales.reduce((sum, sale) => sum + safeNumber(sale.total_sales), 0);
  const totalHistoricalPoints = historicalSales.reduce((sum, sale) => sum + safeNumber(sale.total_points), 0);
  const totalHistoricalOrders = historicalSales.reduce((sum, sale) => sum + safeNumber(sale.total_orders), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Sales Dashboard</h2>
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading sales dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daily Sales Dashboard</h2>
          <p className="text-muted-foreground">Track daily sales performance and points awarded from Supabase</p>
        </div>
        <Button 
          onClick={fetchInitialData} 
          variant="outline" 
          size="sm"
          disabled={loading || searchLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Sales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysSales ? formatCurrency(todaysSales.total_sales) : '₹0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {safeNumber(todaysSales?.total_orders)} orders today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeNumber(todaysSales?.total_points)}</div>
            <p className="text-xs text-muted-foreground">Points awarded today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeNumber(todaysSales?.total_orders)}</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Sales</CardTitle>
          <CardDescription>View sales data for specific date range (Data from Supabase)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end mb-4">
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
            <div className="flex gap-2">
              <Button 
                onClick={handleDateRangeSearch} 
                disabled={!startDate || !endDate || searchLoading}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetToRecentSales}
                disabled={searchLoading}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatCurrency(totalHistoricalSales)}</div>
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
                {searchLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                        Loading sales data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : historicalSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium">No sales data found</p>
                        <p className="text-sm text-muted-foreground">
                          {startDate && endDate 
                            ? `No sales found for the selected date range`
                            : 'No sales data available in the database'
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  historicalSales.map((sale) => {
                    const totalSales = safeNumber(sale.total_sales);
                    const totalOrders = safeNumber(sale.total_orders);
                    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
                    
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{formatDate(sale.sale_date)}</TableCell>
                        <TableCell>{formatCurrency(totalSales)}</TableCell>
                        <TableCell>{safeNumber(sale.total_points)}</TableCell>
                        <TableCell>{totalOrders}</TableCell>
                        <TableCell>{formatCurrency(avgOrderValue)}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {historicalSales.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {historicalSales.length} sales record{historicalSales.length !== 1 ? 's' : ''} 
              {startDate && endDate ? ` from ${formatDate(startDate)} to ${formatDate(endDate)}` : ' (recent data)'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySalesDashboard;
