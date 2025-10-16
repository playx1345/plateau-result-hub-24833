import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Plus, Trash2, ArrowLeft } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { useAuth } from "@/components/AuthWrapper";

interface Course {
  id: string;
  courseTitle: string;
  creditUnit: number;
  grade: string;
  gradePoint: number;
}

const gradePoints: { [key: string]: number } = {
  'A': 5,
  'B': 4,
  'C': 3,
  'D': 2,
  'E': 1,
  'F': 0,
};

const CGPCalculator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({
    courseTitle: "",
    creditUnit: "",
    grade: "A",
  });

  if (!user) {
    navigate("/auth?mode=login");
    return null;
  }

  const addCourse = () => {
    if (!newCourse.courseTitle || !newCourse.creditUnit) {
      return;
    }

    const course: Course = {
      id: Date.now().toString(),
      courseTitle: newCourse.courseTitle,
      creditUnit: parseFloat(newCourse.creditUnit),
      grade: newCourse.grade,
      gradePoint: gradePoints[newCourse.grade],
    };

    setCourses([...courses, course]);
    setNewCourse({
      courseTitle: "",
      creditUnit: "",
      grade: "A",
    });
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const calculateCGP = () => {
    if (courses.length === 0) return "0.00";
    
    const totalCreditUnits = courses.reduce((sum, course) => sum + course.creditUnit, 0);
    const totalGradePoints = courses.reduce((sum, course) => sum + (course.gradePoint * course.creditUnit), 0);
    
    if (totalCreditUnits === 0) return "0.00";
    
    return (totalGradePoints / totalCreditUnits).toFixed(2);
  };

  const getTotalCreditUnits = () => {
    return courses.reduce((sum, course) => sum + course.creditUnit, 0);
  };

  const getClassification = (cgp: number) => {
    if (cgp >= 4.5) return { text: "Distinction", color: "text-green-600" };
    if (cgp >= 3.5) return { text: "Upper Credit", color: "text-blue-600" };
    if (cgp >= 2.5) return { text: "Lower Credit", color: "text-yellow-600" };
    if (cgp >= 2.0) return { text: "Pass", color: "text-orange-600" };
    return { text: "Fail", color: "text-red-600" };
  };

  const cgpValue = parseFloat(calculateCGP());
  const classification = getClassification(cgpValue);

  return (
    <SidebarProvider defaultOpen={true}>
      <StudentSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <Calculator className="w-5 h-5" />
            <h1 className="text-xl font-semibold">CGP Calculator</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Your Cumulative Grade Point</CardTitle>
              <CardDescription>
                Add your courses with credit units and grades to calculate your CGP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Course Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="courseTitle">Course Title</Label>
                  <Input
                    id="courseTitle"
                    placeholder="e.g., Computer Science"
                    value={newCourse.courseTitle}
                    onChange={(e) => setNewCourse({ ...newCourse, courseTitle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditUnit">Credit Unit</Label>
                  <Input
                    id="creditUnit"
                    type="number"
                    min="1"
                    max="6"
                    placeholder="e.g., 3"
                    value={newCourse.creditUnit}
                    onChange={(e) => setNewCourse({ ...newCourse, creditUnit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select
                    value={newCourse.grade}
                    onValueChange={(value) => setNewCourse({ ...newCourse, grade: value })}
                  >
                    <SelectTrigger id="grade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A (5 points)</SelectItem>
                      <SelectItem value="B">B (4 points)</SelectItem>
                      <SelectItem value="C">C (3 points)</SelectItem>
                      <SelectItem value="D">D (2 points)</SelectItem>
                      <SelectItem value="E">E (1 point)</SelectItem>
                      <SelectItem value="F">F (0 points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addCourse} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </div>
              </div>

              {/* Results Summary */}
              {courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Total Credit Units</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{getTotalCreditUnits()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">CGP</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{calculateCGP()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Classification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${classification.color}`}>
                        {classification.text}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Courses Table */}
              {courses.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Credit Unit</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Grade Point</TableHead>
                        <TableHead>Total Points</TableHead>
                        <TableHead className="w-[80px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.courseTitle}</TableCell>
                          <TableCell>{course.creditUnit}</TableCell>
                          <TableCell>
                            <span className="font-semibold">{course.grade}</span>
                          </TableCell>
                          <TableCell>{course.gradePoint}</TableCell>
                          <TableCell>{(course.gradePoint * course.creditUnit).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCourse(course.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Add courses to calculate your CGP</p>
                </div>
              )}

              {/* Grade Scale Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Grade Scale Reference</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                    <div><span className="font-semibold">A:</span> 70-100 (5 pts)</div>
                    <div><span className="font-semibold">B:</span> 60-69 (4 pts)</div>
                    <div><span className="font-semibold">C:</span> 50-59 (3 pts)</div>
                    <div><span className="font-semibold">D:</span> 45-49 (2 pts)</div>
                    <div><span className="font-semibold">E:</span> 40-44 (1 pt)</div>
                    <div><span className="font-semibold">F:</span> 0-39 (0 pts)</div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default CGPCalculator;
