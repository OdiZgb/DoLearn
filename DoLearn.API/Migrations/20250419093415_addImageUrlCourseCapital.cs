using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoLearn.API.Migrations
{
    /// <inheritdoc />
    public partial class addImageUrlCourseCapital : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "imgURL",
                table: "Courses",
                newName: "ImgURL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImgURL",
                table: "Courses",
                newName: "imgURL");
        }
    }
}
